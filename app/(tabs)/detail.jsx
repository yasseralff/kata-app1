import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function ContributionDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-white dark:bg-black px-4 pt-4">
      {/* back button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="mb-4 flex-row items-center"
      >
        <Ionicons name="chevron-back" size={24} color="#111827" />
        <Text className="ml-1 text-lg dark:text-white">Back</Text>
      </TouchableOpacity>

      {/* Audio Player Card */}
      <View className="bg-gray-900 dark:bg-gray-900 rounded-lg overflow-hidden">
        <View className="h-40 items-center justify-center">
          <Ionicons name="musical-notes" size={64} color="#FFF" />
        </View>
        <View className="px-4 pb-4">
          {/* progress bar */}
          <View className="h-1 bg-gray-700 mb-2 relative">
            <View
              className="absolute left-0 top-0 h-1 bg-white"
              style={{ width: "35%" }} // 1:23 / 3:45 ≈ 35%
            />
          </View>
          {/* times */}
          <View className="flex-row justify-between mb-4">
            <Text className="text-xs text-gray-300">1:23</Text>
            <Text className="text-xs text-gray-300">3:45</Text>
          </View>
          {/* controls */}
          <View className="flex-row justify-center items-center space-x-8">
            <TouchableOpacity>
              <Ionicons name="play-skip-back" size={32} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-white rounded-full p-2">
              <Ionicons name="play" size={32} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="play-skip-forward" size={32} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Title */}
      <Text className="text-xl font-semibold text-gray-900 dark:text-white mt-4">
        Traditional Wedding Song
      </Text>

      {/* Author & Date */}
      <View className="flex-row items-center mt-2">
        {/* placeholder avatar */}
        <Ionicons name="person-circle" size={32} color="#111827" />
        <View className="ml-2">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
            @jakartatunes
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            May 11, 2025
          </Text>
        </View>
      </View>

      {/* Tags */}
      <View className="flex-row flex-wrap mt-4 space-x-2">
        {[
          { label: "West Java" },
          { label: "Audio" },
          { label: "Indonesian" },
        ].map((tag) => (
          <View
            key={tag.label}
            className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full"
          >
            <Text className="text-xs text-gray-600 dark:text-gray-300">
              {tag.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Likes */}
      <View className="flex-row items-center mt-4">
        <Ionicons name="heart" size={20} color="#111827" />
        <Text className="ml-2 text-sm text-gray-700 dark:text-gray-300">
          32
        </Text>
      </View>

      {/* Description */}
      <Text className="mt-4 text-gray-800 dark:text-gray-200 leading-relaxed">
        This was recorded during a traditional wedding ceremony in West Java.
        The song represents the cultural heritage of the region and is typically
        performed during key moments of the ceremony.
      </Text>
    </ScrollView>
  );
}
