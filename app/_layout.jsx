import { Slot } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

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
