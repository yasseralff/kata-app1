import React, { useState, useEffect } from "react";
import { View, Text, Image, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { db } from "../services/firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

export default function ContributionCard({
  data,
  containerStyle = {},
  compact = false,
  hideStats = false,
  onPress,
}) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      if (data.userId) {
        try {
          setLoading(true);
          const userDoc = await getDoc(doc(db, "users", data.userId));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [data.userId]);

  // Check if the current user has liked this contribution
  useEffect(() => {
    if (user && data.likedBy) {
      setIsLiked(data.likedBy.includes(user.uid));
    }
  }, [user, data.likedBy]);

  const handlePress = () => {
    if (onPress) {
      onPress(data);
    } else {
      router.push(`/detail?id=${data.id}`);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();

    if (!user) {
      Alert.alert("Login Required", "Please login to like contributions");
      return;
    }

    try {
      const contributionRef = doc(db, "contributions", data.id);

      // Toggle like
      if (isLiked) {
        // Unlike: Decrement likes and remove user from likedBy array
        await updateDoc(contributionRef, {
          likes: increment(-1),
          likedBy: data.likedBy.filter((id) => id !== user.uid),
        });
        setIsLiked(false);
      } else {
        // Like: Increment likes and add user to likedBy array
        await updateDoc(contributionRef, {
          likes: increment(1),
          likedBy: [...(data.likedBy || []), user.uid],
        });
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Error updating like:", error);
      Alert.alert("Error", "Could not update like status");
    }
  };

  // Placeholder icon/image based on type
  const getIcon = () => {
    if (data.type === "audio")
      return <Ionicons name="volume-high" size={24} color="gray" />;
    if (data.type === "text")
      return <MaterialIcons name="article" size={24} color="gray" />;
    if (data.type === "photo")
      return <Ionicons name="image" size={24} color="gray" />;
    if (data.type === "video")
      return <Ionicons name="videocam" size={24} color="gray" />;
    return "📁"; // fallback
  };

  // Get username from userData if available, otherwise show placeholder
  const getUsername = () => {
    if (userData && userData.username) {
      return userData.username;
    }
    return data.username || "unknown";
  };

  // Compact layout for list views
  if (compact) {
    return (
      <Pressable
        onPress={handlePress}
        className="flex-row items-center bg-gray-100 dark:bg-gray-800 p-3 rounded-xl mb-3"
        style={containerStyle}
      >
        <View className="w-12 h-12 items-center justify-center bg-white dark:bg-gray-900 rounded-lg mr-3">
          <Text className="text-2xl">{getIcon()}</Text>
        </View>
        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="font-semibold text-black dark:text-white text-base"
          >
            {data.title}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {data.language || "Unknown"} • {data.country || "—"}
          </Text>
          {data.location && (
            <Text
              className="text-xs text-gray-500 dark:text-gray-400"
              numberOfLines={1}
            >
              {data.location}
            </Text>
          )}
          {!hideStats && (
            <View className="flex-row items-center mt-1">
              <Text className="text-xs text-gray-400 mr-3">
                @{getUsername()}
              </Text>
              <Pressable onPress={handleLike}>
                <Feather
                  name={isLiked ? "heart" : "heart"}
                  size={12}
                  color={isLiked ? "#FF4081" : "#FF4081"}
                  solid={isLiked}
                />
              </Pressable>
              <Text className="text-xs text-pink-500 ml-1">
                {data.likes || 0}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  }

  // Default card layout
  return (
    <Pressable
      onPress={handlePress}
      className="w-52 mr-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl shadow-sm"
      style={containerStyle}
    >
      {/* Thumbnail / Type Icon */}
      <View className="w-full h-28 items-center justify-center bg-white dark:bg-gray-900 rounded-lg mb-3">
        <Text className="text-4xl">{getIcon()}</Text>
      </View>

      {/* Title */}
      <Text
        numberOfLines={1}
        className="font-semibold text-black dark:text-white text-base mb-1"
      >
        {data.title}
      </Text>

      {/* Language / Location */}
      <Text className="text-sm text-gray-500 dark:text-gray-400">
        {data.language || "Unknown"} • {data.country || "—"}
      </Text>

      {/* Location details if available */}
      {data.location && (
        <View className="flex-row items-center mt-1">
          <MaterialIcons name="location-on" size={14} color="#888" />
          <Text
            className="text-xs text-gray-500 dark:text-gray-400 ml-1"
            numberOfLines={1}
          >
            {data.location}
          </Text>
        </View>
      )}

      {/* Creator & Likes */}
      {!hideStats && (
        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-xs text-gray-400">@{getUsername()}</Text>
          <View className="flex-row items-center">
            <Pressable onPress={handleLike}>
              <Feather
                name="heart"
                size={14}
                color="#FF4081"
                style={{
                  color: isLiked ? "#FF4081" : "#FF4081",
                  opacity: isLiked ? 1 : 0.7,
                }}
              />
            </Pressable>
            <Text className="text-xs text-pink-500 ml-1">
              {data.likes || 0}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}
