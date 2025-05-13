import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

export default function EditProfile() {
  const { user, updateProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    username: "",
    country: "",
    avatar: "",
    bio: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        username: user.username || "",
        country: user.country || "",
        avatar: user.avatar || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.username) {
      Alert.alert("Error", "Name and username are required");
      return;
    }

    try {
      setLoading(true);

      await updateProfile({
        name: form.name,
        username: form.username,
        country: form.country,
        avatar: form.avatar,
        bio: form.bio,
      });

      Alert.alert("Success", "Profile updated successfully");
      router.back();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <Stack.Screen
        options={{
          title: "Edit Profile",
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons
                name="arrow-back"
                size={24}
                color={Platform.OS === "ios" ? "#007AFF" : "#6366F1"}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4">
          <View className="mt-6 space-y-4">
            {/* Profile Image */}
            <View className="items-center mb-2">
              <View className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 mb-2 overflow-hidden items-center justify-center">
                {form.avatar ? (
                  <Image
                    source={{ uri: form.avatar }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons name="person" size={40} color="#9CA3AF" />
                )}
              </View>
              <TouchableOpacity>
                <Text className="text-indigo-600 font-medium">
                  Change Photo
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View className="space-y-4">
              <View>
                <Text className="text-gray-600 dark:text-gray-300 mb-1 font-medium">
                  Name *
                </Text>
                <TextInput
                  value={form.name}
                  onChangeText={(value) => handleChange("name", value)}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-3 text-gray-800 dark:text-white"
                />
              </View>

              <View>
                <Text className="text-gray-600 dark:text-gray-300 mb-1 font-medium">
                  Username *
                </Text>
                <TextInput
                  value={form.username}
                  onChangeText={(value) => handleChange("username", value)}
                  placeholder="Enter your username"
                  placeholderTextColor="#9CA3AF"
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-3 text-gray-800 dark:text-white"
                />
              </View>

              <View>
                <Text className="text-gray-600 dark:text-gray-300 mb-1 font-medium">
                  Country
                </Text>
                <TextInput
                  value={form.country}
                  onChangeText={(value) => handleChange("country", value)}
                  placeholder="Enter your country"
                  placeholderTextColor="#9CA3AF"
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-3 text-gray-800 dark:text-white"
                />
              </View>

              <View>
                <Text className="text-gray-600 dark:text-gray-300 mb-1 font-medium">
                  Avatar URL
                </Text>
                <TextInput
                  value={form.avatar}
                  onChangeText={(value) => handleChange("avatar", value)}
                  placeholder="Enter URL for your profile picture"
                  placeholderTextColor="#9CA3AF"
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-3 text-gray-800 dark:text-white"
                />
                <Text className="text-xs text-gray-500 mt-1">
                  Enter a valid image URL for your profile picture
                </Text>
              </View>

              <View>
                <Text className="text-gray-600 dark:text-gray-300 mb-1 font-medium">
                  Bio
                </Text>
                <TextInput
                  value={form.bio}
                  onChangeText={(value) => handleChange("bio", value)}
                  placeholder="Tell something about yourself"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-3 text-gray-800 dark:text-white min-h-[100]"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className={`mt-6 py-3 rounded-lg items-center ${
                loading ? "bg-indigo-400" : "bg-indigo-600"
              }`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold">Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
