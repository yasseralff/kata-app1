import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { useEffect, useState, useCallback } from "react";
import { db } from "../../services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Link } from "expo-router";
import ContributionCard from "../../components/ContributionCard";
import { useAuth } from "../../context/AuthContext";
import AppLogo from "../../components/AppLogo";
import { useFonts } from "expo-font";

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ audio: 0, text: 0, likes: 0 });
  const [topContributions, setTopContributions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [fontsLoaded] = useFonts({
    Tektur: require("../../assets/fonts/Tektur-VariableFont_wdth,wght.ttf"),
  });

  const fetchData = async () => {
    if (!user?.uid) return;

    // Query only the current user's contributions
    const userContributionsQuery = query(
      collection(db, "contributions"),
      where("userId", "==", user.uid)
    );

    const snap = await getDocs(userContributionsQuery);
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

    // Still get top contributions from all users for discovery
    const allContributionsSnap = await getDocs(collection(db, "contributions"));
    const allContributions = [];
    allContributionsSnap.forEach((doc) => {
      allContributions.push({ id: doc.id, ...doc.data() });
    });

    const top = allContributions
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 5);

    setStats({ audio, text, likes });
    setTopContributions(top);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchData();
    } finally {
      setRefreshing(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchData();
  }, [user?.uid]);

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
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-900 px-4 pt-6"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#6366F1"]}
          tintColor="#6366F1"
        />
      }
    >
      {/* App Logo */}
      <View className="flex justify-items-start mb-6 w-full justify-start border-b border-neutral-400 pb-4">
        <AppLogo size="medium" />
      </View>

      {/* Stats - User's Personal Stats */}
      <View className="mb-2">
        <Text className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">
          Your Stats
        </Text>
      </View>
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
        contentContainerStyle={{ gap: 8 }}
        renderItem={({ item }) => <ContributionCard data={item} />}
      />

      {/* Announcement */}
      <View className="mt-6 overflow-hidden rounded-xl shadow-md">
        <View className="bg-indigo-600 dark:bg-indigo-800 px-4 py-2">
          <View className="flex-row items-center justify-start">
            <Ionicons name="megaphone" size={20} color="#fff" />
            <Text className="ml-2 text-white font-semibold">
              <Text style={{ fontFamily: "Tektur" }}>kata</Text> News
            </Text>
          </View>
        </View>
        <View className="bg-white dark:bg-gray-800 px-4 py-3">
          <Text className="text-sm text-gray-800 dark:text-gray-200 leading-5">
            🎉{" "}
            <Text className="font-bold text-indigo-600 dark:text-indigo-400">
              'Upload page'
            </Text>{" "}
            is now live!
          </Text>
          <View className="flex-row mt-2 justify-end">
            <Text className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              See all updates →
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
