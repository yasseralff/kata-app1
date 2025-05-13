import { Slot } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { LogBox, ActivityIndicator, View, Text } from "react-native";
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Ignore specific warnings
LogBox.ignoreLogs([
  "Text strings must be rendered within a <Text> component",
  // Firebase warnings
  "AsyncStorage has been extracted from react-native core",
  "Setting a timer for a long period of time",
  "Firebase: Error",
  "[2024-", // Common prefix for Firebase timestamp warnings
  "FirebaseError",
  "@firebase/", // Matches warnings from Firebase packages
  "FIRESTORE .* INTERNAL ASSERTION FAILED", // Suppress Firestore internal assertion errors
]);

function LoadingScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-black">
      <ActivityIndicator size="large" color="#6366F1" />
      <Text className="mt-4 text-gray-600 dark:text-gray-300">Loading...</Text>
    </View>
  );
}

function RootLayoutNav() {
  const { loading } = useContext(AuthContext);

  // Show loading screen while authentication is being checked
  if (loading) {
    return <LoadingScreen />;
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SafeAreaView className="flex-1 bg-white dark:bg-black">
          <RootLayoutNav />
        </SafeAreaView>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
