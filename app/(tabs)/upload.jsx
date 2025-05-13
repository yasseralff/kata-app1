import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { Audio } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import { Picker } from "@react-native-picker/picker";
import { storage, db } from "../../services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import langs from "../../constants/langs";
import locations from "../../constants/location";

export default function Upload() {
  const [isAudio, setIsAudio] = useState(true);
  const [recording, setRecording] = useState(null);
  const [audioUri, setAudioUri] = useState(null);
  const [textDocUri, setTextDocUri] = useState(null);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef(null);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const [form, setForm] = useState({
    title: "",
    language: "",
    country: "",
    location: "",
    description: "",
  });
  const { user } = useAuth();

  useEffect(() => {
    // Clean up timer on component unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startTimer = () => {
    setDuration(0);
    timerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handlePickFile = async () => {
    if (isAudio) {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
      });
      if (result.assets?.length) {
        setAudioUri(result.assets[0].uri);
      }
    } else {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "text/plain",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      });
      if (result.assets?.length) {
        setTextDocUri(result.assets[0].uri);
      }
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
        stopTimer();
      } else {
        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(newRecording);
        startTimer();
      }
    } catch (err) {
      console.error("Recording error", err);
      stopTimer();
    }
  };

  const handleSubmit = async () => {
    try {
      if ((isAudio && !audioUri) || (!isAudio && !textDocUri) || !form.title) {
        return Alert.alert("Missing file or title");
      }

      let downloadUrl = "";

      if (isAudio) {
        const filename = `audio_${Date.now()}.m4a`;
        const response = await fetch(audioUri);
        const blob = await response.blob();
        const fileRef = ref(storage, filename);
        await uploadBytes(fileRef, blob);
        downloadUrl = await getDownloadURL(fileRef);
      } else {
        const fileExtension = textDocUri.split(".").pop();
        const filename = `text_${Date.now()}.${fileExtension}`;
        const response = await fetch(textDocUri);
        const blob = await response.blob();
        const fileRef = ref(storage, filename);
        await uploadBytes(fileRef, blob);
        downloadUrl = await getDownloadURL(fileRef);
      }

      const contributionId = `contrib_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}`;

      await addDoc(collection(db, "contributions"), {
        ...form,
        type: isAudio ? "audio" : "text",
        url: downloadUrl,
        userId: user.uid,
        contributionId: contributionId,
        likes: 0,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Upload successful!");
      setAudioUri(null);
      setTextDocUri(null);
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
      className="flex-1 bg-white dark:bg-gray-900"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
      >
        <View className="flex-row justify-center border-b border-gray-200 dark:border-gray-800 pb-4 mb-4">
          <Text className="text-center text-lg font-semibold dark:text-white">
            New Contribution
          </Text>
        </View>

        <View className="flex-row justify-center gap-4">
          <TouchableOpacity
            onPress={() => setIsAudio(true)}
            className={`px-4 py-2 rounded-lg flex-row items-center justify-center gap-2 w-1/2 ${
              isAudio ? "bg-gray-100" : "bg-slate-950"
            }`}
          >
            <FontAwesome
              name="microphone"
              size={20}
              color={isAudio ? "black" : "white"}
            />
            <Text
              className={`font-semibold ${
                isAudio ? "text-black" : "text-white"
              }`}
            >
              Audio
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsAudio(false)}
            className={`px-4 py-3 rounded-lg flex-row items-center justify-center gap-2 w-1/2 ${
              !isAudio ? "bg-gray-100" : "bg-slate-950"
            }`}
          >
            <Ionicons
              name="document-text"
              size={20}
              color={!isAudio ? "black" : "white"}
            />
            <Text
              className={`font-semibold ${
                !isAudio ? "text-black" : "text-white"
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
                  color={isDarkMode ? "white" : "black"}
                />
              </View>
              <Text className="text-lg mt-2 dark:text-white">
                {formatTime(duration)}
              </Text>
            </View>

            <View className="flex-row justify-center gap-2 mb-4 w-full">
              <View className="flex-row justify-center gap-2 w-2/3">
                <TouchableOpacity
                  onPress={handlePickFile}
                  className="px-4 py-3 rounded-lg flex-row items-center justify-center gap-2 w-1/2 bg-gray-100"
                >
                  <Ionicons name="cloud-upload" size={20} color="black" />
                  <Text className="font-semibold text-black">Upload</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleRecord}
                  className="px-4 py-2 rounded-lg flex-row items-center justify-center gap-2 w-1/2 bg-slate-950"
                >
                  <FontAwesome name="microphone" size={20} color="white" />
                  <Text className="font-semibold text-white">Record</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {!isAudio && (
          <>
            <View className="my-6 items-center">
              <View className="w-28 h-28 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
                <Ionicons
                  name="document-text"
                  size={28}
                  color={isDarkMode ? "white" : "black"}
                />
              </View>
              <Text className="text-lg mt-2 dark:text-white">
                {textDocUri ? "Document selected" : "No document selected"}
              </Text>
            </View>

            <View className="flex-row justify-center gap-2 mb-4 w-full">
              <View className="flex-row justify-center gap-2 w-2/3">
                <TouchableOpacity
                  onPress={handlePickFile}
                  className="px-4 py-3 rounded-lg flex-row items-center justify-center gap-2 w-full bg-slate-950"
                >
                  <Ionicons name="cloud-upload" size={20} color="white" />
                  <Text className="font-semibold text-white">
                    Upload Document
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        <View className="flex justify-center gap-4">
          <TextInput
            placeholder="Title"
            placeholderTextColor="#999"
            value={form.title}
            onChangeText={(text) => setForm({ ...form, title: text })}
            className="border border-gray-200 dark:border-gray-700 p-4 rounded dark:bg-gray-800 dark:text-white"
          />

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.language}
              onValueChange={(val) => setForm({ ...form, language: val })}
              dropdownIconColor={isDarkMode ? "#ffffff" : "#000000"}
              style={isDarkMode ? styles.pickerDark : styles.picker}
            >
              <Picker.Item label="Select language" value="" />
              {langs.map((lang, key) => (
                <Picker.Item key={key} label={lang.name} value={lang.code} />
              ))}
            </Picker>
          </View>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.country}
              onValueChange={(val) => setForm({ ...form, country: val })}
              dropdownIconColor={isDarkMode ? "#ffffff" : "#000000"}
              style={isDarkMode ? styles.pickerDark : styles.picker}
            >
              <Picker.Item label="Select country" value="" />
              {locations.map((location, key) => (
                <Picker.Item
                  key={key}
                  label={location.name}
                  value={location.code}
                />
              ))}
            </Picker>
          </View>

          <TextInput
            placeholder="Add location details"
            placeholderTextColor="#999"
            value={form.location}
            onChangeText={(text) => setForm({ ...form, location: text })}
            className="border border-gray-200 dark:border-gray-700 p-4 rounded dark:bg-gray-800 dark:text-white"
          />

          <TextInput
            placeholder="Add context or notes"
            placeholderTextColor="#999"
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
            multiline
            numberOfLines={4}
            className="border border-gray-200 dark:border-gray-700 p-4 rounded mb-4 dark:bg-gray-800 dark:text-white"
            style={styles.textArea}
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-black py-4 rounded items-center mb-8"
        >
          <Text className="text-white font-semibold">Submit Contribution</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 40,
    rowGap: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    backgroundColor: "#f1f1f1",
    borderRadius: 4,
    border: "1px solid #374151",
    // marginBottom: 16,
    overflow: "hidden",
  },
  picker: {
    color: "#000",
    height: 56,
    border: "1px solid #374151",
  },
  pickerDark: {
    color: "#fff",
    backgroundColor: "#1f2937",
    height: 56,
  },
});
