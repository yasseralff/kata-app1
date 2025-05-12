import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function ContributionCard({ data }) {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate("SingleFile", { id: data.id });
  };

  // Placeholder icon/image based on type
  const getIcon = () => {
    if (data.type === "audio") return "🎧";
    if (data.type === "text") return "📄";
    return "📁"; // fallback
  };

  return (
    <Pressable
      onPress={handlePress}
      className="w-52 mr-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl shadow-sm"
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

      {/* Creator & Likes */}
      <View className="flex-row justify-between items-center mt-2">
        <Text className="text-xs text-gray-400">
          @{data.username || "unknown"}
        </Text>
        <Text className="text-xs text-pink-500">❤️ {data.likes || 0}</Text>
      </View>
    </Pressable>
  );
}
