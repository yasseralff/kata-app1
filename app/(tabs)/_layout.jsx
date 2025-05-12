import { Tabs } from "expo-router";
import { View, TouchableOpacity, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Layout() {
  const insets = useSafeAreaInsets();
  const theme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 70 + insets.bottom,
          paddingBottom: insets.bottom + 10,
          paddingTop: 10,
          backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff", // dark:bg-gray-800
          borderTopWidth: 0,
          elevation: 10,
        },
      }}
      tabBar={({ state, descriptors, navigation }) => (
        <View className="flex-row items-center justify-around px-4 border-t h-[70px] bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const iconMap = {
              home: "home",
              search: "search",
              upload: "add",
              notifications: "notifications",
              profile: "person",
            };

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                className="items-center flex-1"
              >
                <Ionicons
                  name={iconMap[route.name]}
                  size={22}
                  color={
                    isFocused
                      ? theme === "dark"
                        ? "#ffffff"
                        : "#111827"
                      : "#9ca3af"
                  }
                />
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="upload" />
      <Tabs.Screen name="notifications" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
