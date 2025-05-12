import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import { twMerge } from "tailwind-merge";

const filters = ["All", "Audio", "Text", "Photo"];

export default function Search() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, "contributions"));
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setData(items);
    };

    fetchData();
  }, []);

  useEffect(() => {
    let res = data;

    if (filter !== "All") {
      res = res.filter((item) => item.type === filter.toLowerCase());
    }

    if (search.trim()) {
      res = res.filter((item) =>
        item.title?.toLowerCase().includes(search.trim().toLowerCase())
      );
    }

    setFiltered(res);
  }, [data, search, filter]);

  return (
    <View className="flex-1 px-4 pt-4 bg-white dark:bg-black">
      <View className="flex-row items-center border rounded-md px-3 py-2 bg-gray-100 dark:bg-neutral-900">
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TextInput
          className="ml-2 flex-1 text-sm text-black dark:text-white"
          placeholder="Search kata..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
        <Ionicons name="options" size={18} color="#9CA3AF" />
      </View>

      <View className="flex-row justify-around mt-3">
        {filters.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setFilter(item)}
            className={twMerge(
              "px-4 py-1 rounded-full border",
              filter === item
                ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                : "text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700"
            )}
          >
            <Text className="text-sm font-medium">{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        className="mt-4"
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
            <Text className="font-semibold text-black dark:text-white">
              {item.title}
            </Text>
            <Text className="text-gray-600 dark:text-gray-400">
              {item.language}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-500">
              {item.location}
            </Text>
            <View className="flex-row items-center mt-1 space-x-2">
              <Ionicons name="person" size={16} color="#6B7280" />
              <Text className="text-gray-700 dark:text-gray-300">
                @{item.username}
              </Text>
              <Ionicons name="heart" size={14} color="#6B7280" />
              <Text className="text-gray-700 dark:text-gray-300">
                {item.likes}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
