import React, { useState, useEffect } from "react";
import { View, Text, Image } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../context/AuthContext";
import { useFonts } from "expo-font";

export default function SplashScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Tektur: require("../assets/fonts/Tektur-VariableFont_wdth,wght.ttf"),
  });

  useEffect(() => {
    // Navigate after a delay without animation
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isReady && fontsLoaded) {
    return user ? <Redirect href="/(tabs)/home" /> : <Redirect href="/login" />;
  }

  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
      <StatusBar style="auto" />
      <View className="items-center">
        <Image
          source={require("../assets/Kata Logo.png")}
          style={{ width: 120, height: 120 }}
          className="mb-4"
        />
        <Text
          style={{ fontFamily: "Tektur" }}
          className="text-4xl text-gray-800 dark:text-white mt-2"
        >
          kata
        </Text>
      </View>
    </View>
  );
}
