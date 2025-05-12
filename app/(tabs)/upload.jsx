import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Audio } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import { Picker } from "@react-native-picker/picker";
import { storage, db } from "../../services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { twMerge } from "tailwind-merge";
import { FontAwesome, Ionicons } from "@expo/vector-icons";

export default function Upload() {
  const [isAudio, setIsAudio] = useState(true);
  const [recording, setRecording] = useState(null);
  const [audioUri, setAudioUri] = useState(null);
  const [form, setForm] = useState({
    title: "",
    language: "",
    country: "",
    location: "",
    description: "",
  });
  const { user } = useAuth();

  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "audio/*",
    });
    if (result.assets?.length) {
      setAudioUri(result.assets[0].uri);
    }
  };

  const handleRecord = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return Alert.alert("Permission required");

      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setAudioUri(uri);
        setRecording(null);
      } else {
        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(newRecording);
      }
    } catch (err) {
      console.error("Recording error", err);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!audioUri || !form.title) {
        return Alert.alert("Missing audio or title");
      }

      const filename = `audio_${Date.now()}.m4a`;
      const response = await fetch(audioUri);
      const blob = await response.blob();
      const audioRef = ref(storage, filename);
      await uploadBytes(audioRef, blob);
      const downloadUrl = await getDownloadURL(audioRef);

      await addDoc(collection(db, "contributions"), {
        ...form,
        type: "audio",
        url: downloadUrl,
        uid: user.uid,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Upload successful!");
      setAudioUri(null);
      setForm({
        title: "",
        language: "",
        country: "",
        location: "",
        description: "",
      });
    } catch (err) {
      console.error("Upload error", err);
      Alert.alert("Upload failed");
    }
  };

  return (
    <ScrollView className="flex-1 px-4 pt-6 bg-white dark:bg-gray-900 gap-4">
      <View className="flex-row justify-center border-b border-gray-200 dark:border-gray-800 pb-4">
        <Text className="text-center text-lg font-semibold dark:text-white">
          New Contribution
        </Text>
      </View>

      <View className="flex-row justify-center gap-2 mt-4">
        <TouchableOpacity
          onPress={() => setIsAudio(true)}
          className={`px-4 py-2 rounded-lg flex-row items-center justify-center gap-2 w-1/2 ${
            isAudio ? "bg-slate-950 text-white" : "bg-gray-100 text-slate-950"
          }`}
        >
          <FontAwesome
            name="microphone"
            size={20}
            color={isAudio ? "white" : "black"}
          />
          <Text
            className={`font-semibold ${
              isAudio ? "text-white" : "text-slate-950"
            }`}
          >
            Audio
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsAudio(false)}
          className={`px-4 py-3 rounded-lg flex-row items-center justify-center gap-2 w-1/2 ${
            !isAudio ? "bg-black text-white" : "bg-gray-100 text-black"
          }`}
        >
          <Ionicons
            name="document-text"
            size={20}
            color={!isAudio ? "white" : "black"}
          />
          <Text
            className={`font-semibold ${
              !isAudio ? "text-white" : "text-black"
            }`}
          >
            Text
          </Text>
        </TouchableOpacity>
      </View>

      {isAudio && (
        <>
          <View className="my-6 items-center">
            <View className="w-28 h-28 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
              <FontAwesome
                name="microphone"
                size={28}
                color={isAudio ? "white" : "black"}
              />
            </View>
            <Text className="text-lg mt-2 dark:text-white">00:00</Text>
          </View>

          <View className="flex-row justify-center gap-2 mb-4 w-full">
            <View className="flex-row justify-center gap-2 w-1/3">
              <TouchableOpacity
                onPress={() => setIsAudio(false)}
                className={`px-4 py-3 rounded-lg flex-row items-center justify-center gap-2 w-1/2 ${
                  !isAudio ? "bg-black text-white" : "bg-gray-100 text-black"
                }`}
              >
                <Ionicons
                  name="cloud-upload"
                  size={20}
                  color={!isAudio ? "white" : "black"}
                />
                <Text
                  className={`font-semibold ${
                    !isAudio ? "text-white" : "text-black"
                  }`}
                >
                  Upload
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsAudio(true)}
                className={`px-4 py-2 rounded-lg flex-row items-center justify-center gap-2 w-1/2 ${
                  isAudio
                    ? "bg-slate-950 text-white"
                    : "bg-gray-100 text-slate-950"
                }`}
              >
                <FontAwesome
                  name="microphone"
                  size={20}
                  color={isAudio ? "white" : "black"}
                />
                <Text
                  className={`font-semibold ${
                    isAudio ? "text-white" : "text-slate-950"
                  }`}
                >
                  Record
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row justify-center space-x-4 mb-6">
            <TouchableOpacity
              onPress={handlePickFile}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
            >
              <Text className="dark:text-white">⬆ Upload</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleRecord}
              className="px-4 py-2 bg-black rounded"
            >
              <Text className="text-white">
                {recording ? "⏹ Stop" : "🎙 Record"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <TextInput
        placeholder="Give your recording a title"
        placeholderTextColor="#999"
        value={form.title}
        onChangeText={(text) => setForm({ ...form, title: text })}
        className="border px-4 py-2 rounded mb-4 dark:bg-gray-800 dark:text-white"
      />
      <Picker
        selectedValue={form.language}
        onValueChange={(val) => setForm({ ...form, language: val })}
        className="bg-white dark:bg-gray-800 mb-4 text-black dark:text-white"
      >
        <Picker.Item label="Select language" value="" />
        <Picker.Item label="English" value="en" />
        <Picker.Item label="Hindi" value="hi" />
        <Picker.Item label="Urdu" value="ur" />
        {/* Add more */}
      </Picker>
      <Picker
        selectedValue={form.country}
        onValueChange={(val) => setForm({ ...form, country: val })}
        className="bg-white dark:bg-gray-800 mb-4 text-black dark:text-white"
      >
        <Picker.Item label="Select country" value="" />
        <Picker.Item label="Pakistan" value="pk" />
        <Picker.Item label="India" value="in" />
        {/* Add more */}
      </Picker>

      <TextInput
        placeholder="Add location details"
        placeholderTextColor="#999"
        value={form.location}
        onChangeText={(text) => setForm({ ...form, location: text })}
        className="border px-4 py-2 rounded mb-4 dark:bg-gray-800 dark:text-white"
      />
      <TextInput
        placeholder="Add context or notes"
        placeholderTextColor="#999"
        value={form.description}
        onChangeText={(text) => setForm({ ...form, description: text })}
        multiline
        className="border px-4 py-2 rounded mb-4 dark:bg-gray-800 dark:text-white"
      />

      <TouchableOpacity
        onPress={handleSubmit}
        className="bg-black py-3 rounded items-center"
      >
        <Text className="text-white font-semibold">Submit Contribution</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
