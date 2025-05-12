import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "expo-router";

export default function Home() {
  const [stats, setStats] = useState({ audio: 0, text: 0, likes: 0 });
  const [topContributions, setTopContributions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDocs(collection(db, "contributions"));
      let audio = 0,
        text = 0,
        likes = 0,
        all = [];

      snap.forEach((doc) => {
        const data = doc.data();
        if (data.type === "audio") audio++;
        if (data.type === "text") text++;
        likes += data.likes || 0;
        all.push({ id: doc.id, ...data });
      });

      const top = all
        .sort((a, b) => (b.likes || 0) - (a.likes || 0))
        .slice(0, 5);

      setStats({ audio, text, likes });
      setTopContributions(top);
    };

    fetchData();
  }, []);

  const StatBox = ({ icon: Icon, value, label }) => (
    <View className="flex-1 items-center p-3 bg-white dark:bg-gray-800 rounded-xl shadow-md mx-1">
      <Icon size={22} color="gray" />
      <Text className="text-lg font-bold text-gray-800 dark:text-gray-100">
        {value}
      </Text>
      <Text className="text-sm text-gray-500 dark:text-gray-400">{label}</Text>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900 px-4 pt-6">
      {/* Stats */}
      <View className="flex-row justify-between mb-6">
        <StatBox
          icon={(props) => <Ionicons name="volume-high" {...props} />}
          value={stats.audio}
          label="Audio Files"
        />
        <StatBox
          icon={(props) => <MaterialIcons name="article" {...props} />}
          value={stats.text}
          label="Text Posts"
        />
        <StatBox
          icon={(props) => <Feather name="heart" {...props} />}
          value={stats.likes}
          label="Total Likes"
        />
      </View>

      {/* Top Contributions */}
      <Text className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
        Top Contributions
      </Text>
      <FlatList
        data={topContributions}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <Link href={`/detail?id=${item.id}`} asChild>
            <TouchableOpacity className="w-52 bg-white dark:bg-gray-800 rounded-xl shadow p-3">
              <View className="w-full h-28 bg-gray-100 dark:bg-gray-700 rounded-lg items-center justify-center mb-2">
                {item.type === "audio" ? (
                  <Ionicons name="volume-high" size={24} color="gray" />
                ) : (
                  <MaterialIcons name="article" size={24} color="gray" />
                )}
              </View>
              <Text className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
                {item.title || "Untitled"}
              </Text>
              <View className="flex-row flex-wrap gap-1 mb-2">
                <Text className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                  {item.language || "Unknown"}
                </Text>
                {item.country && (
                  <Text className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                    {item.country}
                  </Text>
                )}
              </View>
              <View className="flex-row items-center justify-between mt-1">
                <View className="flex-row items-center">
                  <MaterialIcons name="location-on" size={14} color="#888" />
                  <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    {item.region
                      ? `MY ${item.region}`
                      : item.country
                      ? `MY ${item.country}`
                      : ""}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Feather name="heart" size={14} color="gray" />
                  <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    {item.likes || 0}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </Link>
        )}
      />

      {/* Announcement */}
      <View className="flex-row items-center gap-2 mt-6 px-3 py-2 bg-[#fef3c7] dark:bg-[#78350f] rounded-xl">
        <Ionicons name="megaphone" size={20} color="#92400e" />
        <Text className="text-sm text-[#92400e] dark:text-[#fef3c7]">
          🎉 New category 'Field Stories' is now live!
        </Text>
      </View>
    </ScrollView>
  );
}
