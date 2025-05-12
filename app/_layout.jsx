import { Slot } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { LogBox } from "react-native";

// Ignore specific warnings
LogBox.ignoreLogs(["Text strings must be rendered within a <Text> component"]);

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SafeAreaView className="flex-1 bg-white dark:bg-black">
          <Slot /> {/* renders the current screen */}
        </SafeAreaView>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
