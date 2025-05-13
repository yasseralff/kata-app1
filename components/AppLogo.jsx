import { View, Text, Image } from "react-native";
import { useFonts } from "expo-font";

export default function AppLogo({ size = "small" }) {
  const [fontsLoaded] = useFonts({
    Tektur: require("../assets/fonts/Tektur-VariableFont_wdth,wght.ttf"),
  });

  // Size variants
  const logoSizes = {
    small: 24,
    medium: 36,
    large: 48,
  };

  const textSizes = {
    small: "text-lg",
    medium: "text-2xl",
    large: "text-3xl",
  };

  return (
    <View className="flex-row items-center justify-start">
      <Image
        source={require("../assets/Kata Logo.png")}
        style={{ width: logoSizes[size], height: logoSizes[size] }}
        className="mr-2"
      />
      <Text
        style={{ fontFamily: fontsLoaded ? "Tektur" : null }}
        className={`${textSizes[size]} text-gray-800 dark:text-white`}
      >
        kata
      </Text>
    </View>
  );
}
