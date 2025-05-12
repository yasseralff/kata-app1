// app/menu.jsx
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";

export default function MenuScreen() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(); // your AuthContext signOut
      router.replace("/"); // back to login screen which is index.js
    } catch (e) {
      Alert.alert("Logout failed");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black px-4">
      <View className="flex-row items-center py-3 border-b border-gray-200 dark:border-gray-700 relative">
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ position: "absolute", left: 0, zIndex: 1 }}
        >
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text className="text-lg font-semibold text-center dark:text-white">
            Menu
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleLogout}
        className="flex-row items-center p-4 mt-6 bg-gray-100 dark:bg-gray-800 rounded-lg"
      >
        <Ionicons name="log-out-outline" size={20} color="#e53e3e" />
        <Text className="ml-3 text-base font-medium text-red-600 dark:text-red-400">
          Log Out
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
