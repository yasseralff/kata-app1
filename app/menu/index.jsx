// app/menu.jsx
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";

export default function MenuScreen() {
  const { signOut, deleteAccount } = useAuth();
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(); // your AuthContext signOut
      router.replace("/"); // back to login screen which is index.js
    } catch (e) {
      Alert.alert("Logout failed");
    }
  };

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      Alert.alert("Error", "Please enter your password");
      return;
    }

    setIsLoading(true);
    try {
      await deleteAccount(password);
      router.replace("/"); // Navigate back to login screen
    } catch (error) {
      console.error("Delete account error:", error);
      let errorMessage = "Failed to delete account";
      if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many attempts. Try again later";
      }
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
      setPassword("");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black px-4">
      <View className="flex-row items-center py-3 border-b border-gray-200 dark:border-gray-700 relative">
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ position: "absolute", left: 0, zIndex: 1 }}
        >
          <Ionicons name="chevron-back" size={24} color="#9ca3af" />
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

      <TouchableOpacity
        onPress={() => setShowDeleteModal(true)}
        className="flex-row items-center p-4 mt-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
      >
        <Ionicons name="trash-outline" size={20} color="#e53e3e" />
        <Text className="ml-3 text-base font-medium text-red-600 dark:text-red-400">
          Delete Account
        </Text>
      </TouchableOpacity>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-4/5 bg-white dark:bg-gray-800 p-6 rounded-lg">
            <Text className="text-lg font-bold mb-4 text-center dark:text-white">
              Delete Account
            </Text>
            <Text className="mb-4 text-gray-700 dark:text-gray-300">
              This action cannot be undone. Enter your password to confirm.
            </Text>

            <TextInput
              className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg mb-4 dark:text-white"
              placeholder="Enter your password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <View className="flex-row justify-between mt-2">
              <TouchableOpacity
                onPress={() => {
                  setShowDeleteModal(false);
                  setPassword("");
                }}
                className="py-2 px-4 bg-gray-200 dark:bg-gray-700 rounded-lg"
              >
                <Text className="text-gray-800 dark:text-gray-200">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDeleteAccount}
                disabled={isLoading}
                className="py-2 px-4 bg-red-600 rounded-lg"
              >
                <Text className="text-white">
                  {isLoading ? "Deleting..." : "Delete"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
