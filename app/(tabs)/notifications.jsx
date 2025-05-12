import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import {
  useAudioRecorder,
  RecordingOptions,
  AudioModule,
  RecordingPresets,
  useAudioPlayer,
} from "expo-audio";

export default function notifications() {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState(null);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);

  const player = useAudioPlayer(audioUri);

  const record = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
    setIsRecording(true);
    const recordingTime = audioRecorder.currentTime;
    setAudioCurrentTime(recordingTime);
  };

  const stopRecording = async () => {
    // The recording will be available on `audioRecorder.uri`.
    await audioRecorder.stop();
    setIsRecording(false);
    const uri = audioRecorder.uri;
    setAudioUri(uri);
    console.log(uri);
    const recordingTime = audioRecorder.currentTime;
    setAudioCurrentTime(recordingTime);
  };

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert("Permission to access microphone was denied");
      }
    })();

    (() => {
      const status = audioRecorder.currentTime;
      setAudioCurrentTime(status);
      console.log(status);
    })();
  }, []);

  return (
    <View className="flex-1 items-center justify-center gap-4">
      <Text className="text-2xl font-bold">Notifications</Text>

      <TouchableOpacity
        className="bg-black px-4 py-2 rounded-3xl"
        onPress={isRecording ? stopRecording : record}
      >
        <Text className="text-white">
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Text>
      </TouchableOpacity>

      <Text className="text-sm text-gray-500">
        Duration: {audioCurrentTime} seconds
      </Text>

      <TouchableOpacity
        className="bg-black px-4 py-2 rounded-3xl"
        onPress={() => player.play()}
      >
        <Text className="text-white">Play Sound</Text>
      </TouchableOpacity>

      <Text className="text-sm text-gray-500">
        You will see your audio here: {audioUri}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({});
