import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
  ToastAndroid,
  Platform,
} from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Audio } from "expo-av";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../services/firebase";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { useAuth } from "../../context/AuthContext";

export default function ContributionDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const positionTimer = useRef(null);
  const { user } = useAuth();

  // Request media library permissions
  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          console.log("Media library permission not granted");
          // We'll handle this gracefully in the download function
        }
      }
    })();
  }, []);

  // Fetch contribution and user data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const docRef = doc(db, "contributions", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const contributionData = { id: docSnap.id, ...docSnap.data() };
          setData(contributionData);

          // Check if user has liked this contribution
          if (user && contributionData.likedBy) {
            setIsLiked(contributionData.likedBy.includes(user.uid));
          }

          // Fetch user data if userId exists
          if (contributionData.userId) {
            const userRef = doc(db, "users", contributionData.userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              setUserData(userSnap.data());
            }
          }
        } else {
          Alert.alert("Error", "Contribution not found");
          router.back();
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to load contribution");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  // Load audio
  useEffect(() => {
    if (data?.url && data.type === "audio") {
      loadAudio();
    }

    return () => {
      // Clean up audio
      if (sound) {
        sound.unloadAsync();
      }
      if (positionTimer.current) {
        clearInterval(positionTimer.current);
      }
    };
  }, [data]);

  const loadAudio = async () => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: data.url },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
    } catch (error) {
      console.error("Error loading audio:", error);
      Alert.alert("Error", "Failed to load audio file");
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);
      setIsPlaying(status.isPlaying);

      // Update the UI when playback finishes
      if (status.didJustFinish) {
        setIsPlaying(false);
      }
    }
  };

  const playPause = async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.error("Error controlling playback:", error);
    }
  };

  const replay = async () => {
    if (!sound) return;

    try {
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch (error) {
      console.error("Error replaying:", error);
    }
  };

  const seekBackward = async () => {
    if (!sound) return;

    try {
      const newPosition = Math.max(0, position - 10000); // go back 10 seconds
      await sound.setPositionAsync(newPosition);
    } catch (error) {
      console.error("Error seeking backward:", error);
    }
  };

  const seekForward = async () => {
    if (!sound) return;

    try {
      const newPosition = Math.min(duration, position + 10000); // go forward 10 seconds
      await sound.setPositionAsync(newPosition);
    } catch (error) {
      console.error("Error seeking forward:", error);
    }
  };

  const formatTime = (millis) => {
    if (!millis) return "00:00";
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, "0")}`;
  };

  const handleLike = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to like contributions");
      return;
    }

    try {
      const contributionRef = doc(db, "contributions", id);

      // Toggle like
      if (isLiked) {
        // Unlike: Decrement likes and remove user from likedBy array
        await updateDoc(contributionRef, {
          likes: increment(-1),
          likedBy: data.likedBy.filter((id) => id !== user.uid),
        });

        // Update local state
        setIsLiked(false);
        setData({
          ...data,
          likes: (data.likes || 0) - 1,
          likedBy: data.likedBy.filter((id) => id !== user.uid),
        });
      } else {
        // Like: Increment likes and add user to likedBy array
        await updateDoc(contributionRef, {
          likes: increment(1),
          likedBy: [...(data.likedBy || []), user.uid],
        });

        // Update local state
        setIsLiked(true);
        setData({
          ...data,
          likes: (data.likes || 0) + 1,
          likedBy: [...(data.likedBy || []), user.uid],
        });
      }
    } catch (error) {
      console.error("Error updating like:", error);
      Alert.alert("Error", "Could not update like status");
    }
  };

  const handleDownload = async () => {
    if (!data?.url) return;

    try {
      setDownloading(true);
      setDownloadProgress(0);

      // Check if running on web
      if (Platform.OS === "web") {
        // On web, we can use the browser's download capability
        window.open(data.url, "_blank");
        setDownloading(false);
        return;
      }

      // Get file extension from URL or use default
      const fileExtension =
        data.url.split(".").pop() || (data.type === "audio" ? "mp3" : "txt");
      const fileName = `${
        data.title || "download"
      }_${Date.now()}.${fileExtension}`;

      // Create a callback to track download progress
      const progressCallback = (downloadProgress) => {
        const progress =
          downloadProgress.totalBytesWritten /
          downloadProgress.totalBytesExpectedToWrite;
        setDownloadProgress(progress);
      };

      // Set up download options
      const downloadResumable = FileSystem.createDownloadResumable(
        data.url,
        FileSystem.documentDirectory + fileName,
        {},
        progressCallback
      );

      // Start download
      const { uri } = await downloadResumable.downloadAsync();

      if (uri) {
        try {
          // For audio files, save to media library
          if (data.type === "audio") {
            const asset = await MediaLibrary.createAssetAsync(uri);

            try {
              // Try to create album but don't fail if it doesn't work
              await MediaLibrary.createAlbumAsync("KataApp", asset, false);
            } catch (albumError) {
              console.log(
                "Could not create album, but file is saved:",
                albumError
              );
            }

            // Show success message based on platform
            if (Platform.OS === "android") {
              ToastAndroid.show(
                "Audio saved to your device",
                ToastAndroid.SHORT
              );
            } else {
              Alert.alert("Download Complete", "Audio saved to your device");
            }
          } else {
            // For other files, share them
            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(uri);
            } else {
              Alert.alert("Download Complete", `File saved to your device`);
            }
          }
        } catch (mediaError) {
          console.error("Media library error:", mediaError);
          // Fallback to sharing if media library fails
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri);
          } else {
            Alert.alert("Download Complete", `File saved to ${uri}`);
          }
        }
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      Alert.alert("Download Failed", "Could not download the file");
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this contribution: ${data?.title} ${
          data?.url || ""
        }`,
        title: data?.title,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2 text-gray-600 dark:text-gray-300">
          Loading...
        </Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <Text className="text-gray-600 dark:text-gray-300">No data found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900 px-4 pt-4">
      {/* back button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="mb-4 flex-row items-center"
      >
        <Ionicons name="chevron-back" size={24} color="#9ca3af" />
        <Text className="ml-1 text-lg dark:text-white">Back</Text>
      </TouchableOpacity>

      {/* Audio Player Card */}
      {data.type === "audio" && (
        <View className="bg-gray-900 dark:bg-gray-900 rounded-lg overflow-hidden mb-4">
          <View className="h-40 items-center justify-center">
            <Ionicons name="musical-notes" size={64} color="#FFF" />
          </View>
          <View className="px-4 pb-4">
            {/* progress bar */}
            <View className="h-2 bg-gray-700 mb-2 relative rounded-full overflow-hidden">
              <View
                className="absolute left-0 top-0 h-2 bg-blue-500"
                style={{
                  width: `${duration ? (position / duration) * 100 : 0}%`,
                }}
              />
            </View>
            {/* times */}
            <View className="flex-row justify-between mb-4">
              <Text className="text-xs text-gray-300">
                {formatTime(position)}
              </Text>
              <Text className="text-xs text-gray-300">
                {formatTime(duration)}
              </Text>
            </View>
            {/* controls */}
            <View className="flex-row justify-center items-center space-x-8">
              <TouchableOpacity onPress={seekBackward}>
                <Ionicons name="play-skip-back" size={32} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={playPause}
                className="bg-white rounded-full p-3"
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={32}
                  color="#000"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={seekForward}>
                <Ionicons name="play-skip-forward" size={32} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Title */}
      <Text className="text-xl font-semibold text-gray-900 dark:text-white mt-2">
        {data.title || "Untitled"}
      </Text>

      {/* Author & Date */}
      <View className="flex-row items-center mt-2">
        <Ionicons name="person-circle" size={32} color="#111827" />
        <View className="ml-2">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
            @{userData?.username || "unknown"}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {data.createdAt
              ? new Date(data.createdAt.toDate()).toLocaleDateString()
              : "Unknown date"}
          </Text>
        </View>
      </View>

      {/* Tags */}
      <View className="flex-row flex-wrap mt-4 gap-2">
        {data.language && (
          <View className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
            <Text className="text-xs text-gray-600 dark:text-gray-300">
              {data.language}
            </Text>
          </View>
        )}
        {data.country && (
          <View className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
            <Text className="text-xs text-gray-600 dark:text-gray-300">
              {data.country}
            </Text>
          </View>
        )}
        {data.type && (
          <View className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
            <Text className="text-xs text-gray-600 dark:text-gray-300">
              {data.type}
            </Text>
          </View>
        )}
      </View>

      {/* Likes */}
      <TouchableOpacity
        onPress={handleLike}
        className="flex-row items-center mt-4"
      >
        <Ionicons
          name={isLiked ? "heart" : "heart-outline"}
          size={20}
          color="#FF4081"
        />
        <Text className="ml-2 text-sm text-gray-700 dark:text-gray-300">
          {data.likes || 0}
        </Text>
      </TouchableOpacity>

      {/* Description */}
      {data.description && (
        <Text className="mt-4 text-gray-800 dark:text-gray-200 leading-relaxed">
          {data.description}
        </Text>
      )}

      {/* Action buttons */}
      <View className="flex-row mt-6 mb-8 justify-around">
        <TouchableOpacity
          onPress={handleDownload}
          className="bg-blue-500 py-2 px-4 rounded-lg flex-row items-center"
          disabled={downloading}
        >
          {downloading ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="#ffffff" />
              <Text className="text-white ml-2">
                {Math.round(downloadProgress * 100)}%
              </Text>
            </View>
          ) : (
            <>
              <Ionicons
                name="cloud-download-outline"
                size={20}
                color="#ffffff"
              />
              <Text className="text-white ml-2">Download</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleShare}
          className="bg-gray-200 dark:bg-gray-700 py-2 px-4 rounded-lg flex-row items-center"
        >
          <Ionicons
            name="share-social-outline"
            size={20}
            color={userData ? "#111827" : "#ffffff"}
          />
          <Text className="ml-2 text-gray-800 dark:text-white">Share</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
