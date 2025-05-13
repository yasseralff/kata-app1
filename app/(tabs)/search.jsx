import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import ContributionCard from "../../components/ContributionCard";

const typeFilters = ["All", "Audio", "Text", "Photo", "Video"];

export default function Search() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [languageFilter, setLanguageFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [creatorFilter, setCreatorFilter] = useState("");

  const [data, setData] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [languages, setLanguages] = useState([
    "All",
    "Malay",
    "Chinese",
    "Tamil",
    "English",
    "Indigenous",
  ]);

  const [locations, setLocations] = useState([
    "All",
    "Penang",
    "Kuala Lumpur",
    "Johor",
    "Sabah",
    "Sarawak",
  ]);

  const { user } = useAuth();

  // Fetch languages and locations for filters without fetching all data
  const fetchFilterOptions = async () => {
    try {
      // Just fetch a small sample to get languages and locations
      const languagesQuery = query(collection(db, "contributions"), limit(20));
      const snapshot = await getDocs(languagesQuery);

      if (!snapshot.empty) {
        const items = snapshot.docs.map((doc) => doc.data());

        // Extract unique languages and locations for filters
        const uniqueLanguages = [
          "All",
          ...new Set(items.map((item) => item.language).filter(Boolean)),
        ];
        const uniqueLocations = [
          "All",
          ...new Set(items.map((item) => item.location).filter(Boolean)),
        ];

        if (uniqueLanguages.length > 1) setLanguages(uniqueLanguages);
        if (uniqueLocations.length > 1) setLocations(uniqueLocations);
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Debounce search input
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timerId);
  }, [search]);

  // Trigger search when debounced search changes
  useEffect(() => {
    if (
      debouncedSearch.trim() ||
      typeFilter !== "All" ||
      languageFilter ||
      locationFilter ||
      creatorFilter
    ) {
      handleSearch();
    }
  }, [
    debouncedSearch,
    typeFilter,
    languageFilter,
    locationFilter,
    creatorFilter,
  ]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setSearchPerformed(true);

      // Build a simple query with just the most important filter
      let q = collection(db, "contributions");

      // Determine which filter to apply in the database query
      if (typeFilter !== "All") {
        q = query(q, where("type", "==", typeFilter.toLowerCase()));
      }

      // Get the documents
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        let results = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Apply all other filters client-side
        // Language filter
        if (languageFilter && languageFilter !== "All") {
          results = results.filter(
            (item) =>
              item.language?.toLowerCase() === languageFilter.toLowerCase()
          );
        }

        // Location filter
        if (locationFilter && locationFilter !== "All") {
          results = results.filter((item) =>
            item.location?.toLowerCase().includes(locationFilter.toLowerCase())
          );
        }

        // Creator filter
        if (creatorFilter) {
          results = results.filter((item) =>
            item.username?.toLowerCase().includes(creatorFilter.toLowerCase())
          );
        }

        // Search text filter
        if (debouncedSearch.trim()) {
          results = results.filter((item) =>
            item.title
              ?.toLowerCase()
              .includes(debouncedSearch.trim().toLowerCase())
          );
        }

        // Ensure uniqueness by ID
        const uniqueResults = Array.from(
          new Map(results.map((item) => [item.id, item])).values()
        );

        setData(uniqueResults);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Error searching contributions:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchFilterOptions();
      if (searchPerformed) {
        await handleSearch();
      }
    } finally {
      setRefreshing(false);
    }
  }, [
    searchPerformed,
    debouncedSearch,
    typeFilter,
    languageFilter,
    locationFilter,
    creatorFilter,
  ]);

  const resetFilters = () => {
    setTypeFilter("All");
    setLanguageFilter("");
    setLocationFilter("");
    setCreatorFilter("");
    setSearch("");
    setDebouncedSearch("");
    setData([]);
    setSearchPerformed(false);
  };

  const FilterButton = ({ label, active, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-1 rounded-full border mr-2 ${
        active
          ? "bg-black dark:bg-white border-black dark:border-white"
          : "bg-transparent border-gray-300 dark:border-gray-700"
      }`}
    >
      <Text
        className={`text-sm font-medium ${
          active
            ? "text-white dark:text-black"
            : "text-gray-700 dark:text-gray-300"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const FilterSection = ({ title, options, selectedValue, onSelect }) => (
    <View className="mb-4">
      <Text className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
        {title}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {options.map((option) => (
          <FilterButton
            key={option}
            label={option}
            active={selectedValue === option}
            onPress={() => onSelect(option === "All" ? "" : option)}
          />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View className="flex-1 px-4 pt-4 bg-white dark:bg-gray-900">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1 border rounded-md px-3 py-2 bg-gray-100 dark:bg-neutral-900">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            className="ml-2 flex-1 text-sm text-black dark:text-white"
            placeholder="Search kata..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          className="ml-2 p-2"
        >
          <Ionicons
            name="options-outline"
            size={24}
            color={showFilters ? "#6366F1" : "#9CA3AF"}
          />
        </TouchableOpacity>
      </View>

      {showFilters ? (
        <View className="p-3 bg-gray-50 dark:bg-neutral-900 rounded-lg mb-3">
          <FilterSection
            title="Type"
            options={typeFilters}
            selectedValue={typeFilter}
            onSelect={setTypeFilter}
          />

          <FilterSection
            title="Language"
            options={languages}
            selectedValue={languageFilter || "All"}
            onSelect={setLanguageFilter}
          />

          <FilterSection
            title="Location"
            options={locations}
            selectedValue={locationFilter || "All"}
            onSelect={setLocationFilter}
          />

          <TouchableOpacity
            onPress={resetFilters}
            className="self-end py-2 px-4 rounded-full bg-gray-200 dark:bg-gray-800 mt-2"
          >
            <Text className="text-sm text-gray-700 dark:text-gray-300">
              Reset
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={data}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6366F1"]}
            tintColor="#6366F1"
          />
        }
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContributionCard data={item} containerStyle={{ marginBottom: 10 }} />
        )}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-10">
            {loading ? (
              <ActivityIndicator color="#6366F1" size="large" />
            ) : searchPerformed ? (
              <Text className="text-gray-500 dark:text-gray-400">
                No results found
              </Text>
            ) : (
              <Text className="text-gray-500 dark:text-gray-400">
                Search for kata content
              </Text>
            )}
          </View>
        }
      />
    </View>
  );
}
