import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { user, signUp } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    username: "",
    country: "",
    region: "",
    city: "",
    bio: "",
  });

  useEffect(() => {
    if (user) {
      router.replace("/(tabs)/home");
    }
  }, [user]);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    const { email, password, username, country, name } = form;
    if (!email || !password || !username || !country || !name) {
      return Alert.alert("Please fill in required fields.");
    }

    try {
      await signUp(form);
    } catch (err) {
      console.error("Registration error:", err.message);
      Alert.alert("Registration failed. Please try again.");
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-black px-6 py-10">
      <Text className="text-2xl font-bold text-black dark:text-white mb-6">
        Create Account
      </Text>

      {[
        "email",
        "password",
        "name",
        "username",
        "country",
        "region",
        "city",
      ].map((field, i) => (
        <TextInput
          key={i}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={field === "password"}
          autoCapitalize={field === "email" ? "none" : "words"}
          value={form[field]}
          onChangeText={(v) => handleChange(field, v)}
          className="mb-4 px-4 py-3 border rounded-lg text-black dark:text-white"
        />
      ))}

      <Pressable
        onPress={handleSubmit}
        className="bg-indigo-600 px-5 py-3 rounded-xl items-center mb-4"
      >
        <Text className="text-white font-medium text-base">Register</Text>
      </Pressable>

      <Pressable onPress={() => router.replace("/")}>
        <Text className="text-center text-indigo-500">
          Already have an account? Login
        </Text>
      </Pressable>
    </View>
  );
}
