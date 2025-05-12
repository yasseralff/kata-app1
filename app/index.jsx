import { db } from "../services/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { user, signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) {
      router.replace("/(tabs)/home");
    }
  }, [user]);

  const testFirestore = async () => {
    const docRef = doc(db, "testCollection", "testDoc");
    await setDoc(docRef, { hello: "world" });

    const snap = await getDoc(docRef);
    console.log("Doc data:", snap.data());
  };

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Missing fields");
    }

    try {
      await signIn(email, password);
    } catch (err) {
      console.error("Login error:", err.message);
      Alert.alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-black px-6">
      <Text className="text-3xl font-bold text-black dark:text-white mb-8">
        Welcome to Kata 👋
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        placeholderTextColor="#9CA3AF"
        onChangeText={setEmail}
        autoCapitalize="none"
        className="mb-4 w-full px-4 py-3 border rounded-lg text-black dark:text-white"
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        placeholderTextColor="#9CA3AF"
        value={password}
        onChangeText={setPassword}
        className="mb-6 w-full px-4 py-3 border rounded-lg text-black dark:text-white"
      />

      <Pressable
        onPress={handleLogin}
        className="bg-indigo-600 px-5 py-3 rounded-xl mb-4 w-full items-center"
      >
        <Text className="text-white font-medium text-base">Login</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/register")}>
        <Text className="text-indigo-500">Don’t have an account? Register</Text>
      </Pressable>
    </View>
  );
}
