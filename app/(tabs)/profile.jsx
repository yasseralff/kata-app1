// app/(tabs)/profile.jsx
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Link } from "expo-router";

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("All");

  // dummy data for now
  const stats = [
    { label: "Audio", value: 24 },
    { label: "Text", value: 12 },
    { label: "Likes", value: 156 },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold dark:text-white">Profile</Text>
        <Link href="/menu" asChild>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={24} color="white" />
          </TouchableOpacity>
        </Link>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 80 }}
        className="px-4"
      >
        {/* Avatar & Name */}
        <View className="items-center mt-6 mb-4">
          <Image
            source={{
              uri:
                user?.avatar || "https://ui-avatars.com/api/?name=Sarah+Chen",
            }}
            className="w-20 h-20 rounded-full mb-2"
          />
          <Text className="text-xl font-semibold dark:text-white">
            {user?.name || "Sarah Chen"}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400">
            @{user?.username || "sarahchen"}
          </Text>
          <Text className="text-sm mt-1 text-indigo-600 font-medium">
            MY {user?.country || "Malaysia"}
          </Text>
          <TouchableOpacity className="mt-2 px-4 py-1.5 border border-gray-300 rounded-full">
            <Text className="text-sm text-gray-800 dark:text-white">
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View className="flex-row justify-around mb-6">
          {stats.map((stat) => (
            <View key={stat.label} className="items-center">
              <Text className="font-semibold text-lg dark:text-white">
                {stat.value}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Bio */}
        <Text className="text-center text-gray-600 dark:text-gray-300 text-sm mb-6 px-4">
          Aspiring storyteller, passionate about preserving local dialects and
          traditions 🎵
        </Text>

        {/* Filter Tabs */}
        <View className="flex-row justify-center space-x-2 mb-6">
          {["All", "Audio", "Text"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              className={`px-4 py-1.5 rounded-full border ${
                selectedTab === tab
                  ? "bg-gray-900 border-gray-900"
                  : "bg-transparent border-gray-300"
              }`}
            >
              <Text
                className={
                  selectedTab === tab
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-300"
                }
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Contributions List */}
        <View className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 mb-4 flex-row items-center">
          <View className="w-10 h-10 bg-gray-300 rounded-lg items-center justify-center mr-3">
            <Ionicons name="musical-notes-outline" size={20} color="#6b7280" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-base dark:text-white mb-0.5">
              Traditional Lullaby
            </Text>
            <Text className="text-xs text-gray-600 dark:text-gray-300 mb-0.5">
              Audio • Malay
            </Text>
            <View className="flex-row items-center">
              <Text className="text-xs text-indigo-600 font-medium">
                MY Penang
              </Text>
              <Text className="text-xs text-gray-400 mx-1">•</Text>
              <Ionicons name="heart-outline" size={12} color="#6b7280" />
              <Text className="text-xs text-gray-500 dark:text-gray-300 ml-1">
                23
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
