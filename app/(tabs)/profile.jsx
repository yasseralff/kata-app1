// app/(tabs)/profile.jsx
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { Link } from "expo-router";
import { db } from "../../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import ContributionCard from "../../components/ContributionCard";

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("All");
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ audio: 0, text: 0, likes: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserContributions = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const q = query(
        collection(db, "contributions"),
        where("userId", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      const userContributions = [];
      let audioCount = 0;
      let textCount = 0;
      let totalLikes = 0;

      querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        userContributions.push(data);

        if (data.type === "audio") audioCount++;
        if (data.type === "text") textCount++;
        totalLikes += data.likes || 0;
      });

      setContributions(userContributions);
      setStats({
        audio: audioCount,
        text: textCount,
        likes: totalLikes,
      });
    } catch (error) {
      console.error("Error fetching user contributions:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchUserContributions();
    } finally {
      setRefreshing(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchUserContributions();
  }, [user?.uid]);

  const filteredContributions = contributions.filter((item) => {
    if (selectedTab === "All") return true;
    return item.type.toLowerCase() === selectedTab.toLowerCase();
  });

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <Text className="text-lg font-semibold dark:text-white">Profile</Text>
        <Link href="/menu" asChild>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={24} color="white" />
          </TouchableOpacity>
        </Link>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 80 }}
        className="px-4 dark:bg-gray-900"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6366F1"]}
            tintColor="#6366F1"
          />
        }
      >
        {/* Avatar & Name */}
        <View className="items-center mt-6 mb-4">
          <View className="flex-row items-center gap-2 justify-start w-full">
            <Image
              source={{
                uri:
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${
                    user?.name?.split(" ")[0]
                  }`,
              }}
              className="w-20 h-20 rounded-full mb-2"
            />

            <View className="flex-col items-start gap-1 text-left">
              <Text className="text-xl font-semibold dark:text-white">
                {user?.name || "Sarah Chen"}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400">
                @{user?.username || "sarahchen"}
              </Text>
              <Text className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                {user?.country || "Malaysia"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="mt-2 px-4 py-1.5 border border-gray-300 w-full text-center rounded-lg"
            onPress={() => router.push("/edit-profile")}
          >
            <Text className="text-sm text-gray-800 dark:text-white text-center">
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View className="flex-row justify-around mb-6">
          <View className="items-center">
            <Text className="font-semibold text-lg dark:text-white">
              {stats.audio}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Audio
            </Text>
          </View>
          <View className="items-center">
            <Text className="font-semibold text-lg dark:text-white">
              {stats.text}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Text
            </Text>
          </View>
          <View className="items-center">
            <Text className="font-semibold text-lg dark:text-white">
              {stats.likes}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Likes
            </Text>
          </View>
        </View>

        {/* Bio */}
        <Text className="text-center text-gray-600 dark:text-gray-300 text-sm mb-6 px-4">
          {user?.bio ||
            "Aspiring storyteller, passionate about preserving local dialects and traditions 🎵"}
        </Text>

        {/* Filter Tabs */}
        <View className="flex-row justify-start space-x-2 mb-6 gap-2">
          {["All", "Audio", "Text"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              className={`px-4 py-1.5 rounded-full border ${
                selectedTab === tab
                  ? "bg-gray-900 dark:bg-white border-gray-900 dark:border-white"
                  : "bg-transparent border-gray-300 dark:border-gray-300"
              }`}
            >
              <Text
                className={
                  selectedTab === tab
                    ? "text-gray-900 dark:text-gray-900"
                    : "text-gray-600 dark:text-gray-300"
                }
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* User Contributions */}
        {loading ? (
          <Text className="text-center text-gray-500 dark:text-gray-400 my-4">
            Loading contributions...
          </Text>
        ) : filteredContributions.length > 0 ? (
          filteredContributions.map((item) => (
            <ContributionCard
              key={item.id}
              data={item}
              compact={true}
              containerStyle={{ marginBottom: 12 }}
            />
          ))
        ) : (
          <Text className="text-center text-gray-500 dark:text-gray-400 my-4">
            No{" "}
            {selectedTab.toLowerCase() !== "all"
              ? selectedTab.toLowerCase()
              : ""}{" "}
            contributions found
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
