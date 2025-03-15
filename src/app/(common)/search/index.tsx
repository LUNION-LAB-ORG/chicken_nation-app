import React, { useState, useEffect } from "react";
import { View, KeyboardAvoidingView, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import BackButtonTwo from "@/components/ui/BackButtonTwo";
import SearchBar from "@/components/search/SearchBar";
import SearchHistory from "@/components/search/SearchHistory";
import SearchResults from "@/components/search/SearchResults";
import SearchFilter from "@/components/search/SearchFilter";
import PopularCuisines from "@/components/search/PopularCuisines";
import { useAuth } from "@/app/context/AuthContext";
import { menuItems } from "@/data/MockedData";
import AsyncStorage from "@react-native-async-storage/async-storage";

const sortOptions = [
  "Le plus proches",
  "Prix croissant",
  "Prix décroissant",
  "Mieux notés",
];

const popularCuisines = [
  "Burgers",
  "Pizza",
  "Poulet",
  "Salades",
  "Sandwichs",
  "Desserts",
];

const MAX_HISTORY_ITEMS = 4; // Limite à 4 recherches récentes

const SearchScreen = () => {
  const { isAuthenticated } = useAuth();
  const [searchResults, setSearchResults] = useState(menuItems);
  const [searchText, setSearchText] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedSort, setSelectedSort] = useState("");
  const [sliderValue, setSliderValue] = useState(2000);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Charger l'historique au démarrage
  useEffect(() => {
    loadSearchHistory();
  }, []);

  /**
   * Charge l'historique depuis le stockage local
   */
  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem("searchHistory");
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
    }
  };

  /**
   * Sauvegarde une recherche dans l'historique
   * Ne sauvegarde que les recherches complètes, pas les lettres intermédiaires
   */
  const saveToHistory = async (text: string) => {
    if (!text.trim() || text.length < 3) return; // Ignorer les recherches trop courtes

    try {
      // Filtrer les doublons et limiter à MAX_HISTORY_ITEMS
      const newHistory = [
        text,
        ...searchHistory.filter((item) => item !== text),
      ].slice(0, MAX_HISTORY_ITEMS);

      await AsyncStorage.setItem("searchHistory", JSON.stringify(newHistory));
      setSearchHistory(newHistory);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde dans l'historique:", error);
    }
  };

  /**
   * Gestionnaire de recherche amélioré
   * Filtre les résultats en temps réel mais ne sauvegarde pas dans l'historique
   */
  const handleSearch = (text: string) => {
    setSearchText(text);

    if (!text.trim()) {
      setSearchResults([]);
      return;
    }

    // Filtrage des résultats
    let filtered = menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(text.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(text.toLowerCase())) ||
        item.restaurant.toLowerCase().includes(text.toLowerCase()),
    );

    // Appliquer les filtres existants
    if (selectedSort) {
      filtered = sortResults(filtered, selectedSort);
    }
    filtered = filtered.filter((item) => parseInt(item.price) <= sliderValue);

    setSearchResults(filtered);
  };

 
  const handleSearchComplete = (text: string) => {
    if (text.trim().length >= 3) {
      saveToHistory(text);
    }
  };

  /**
   * Tri des résultats selon l'option sélectionnée
   */
  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    setSearchResults((prev) => sortResults([...prev], sort));
  };

  const sortResults = (results: typeof menuItems, sort: string) => {
    switch (sort) {
      case "Prix croissant":
        return results.sort((a, b) => parseInt(a.price) - parseInt(b.price));
      case "Prix décroissant":
        return results.sort((a, b) => parseInt(b.price) - parseInt(a.price));
      case "Mieux notés":
        return results.sort((a, b) => b.rating - a.rating);
      default:
        return results;
    }
  };

  /**
   * Gestion du filtre de prix
   */
  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    const filtered = menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) &&
        parseInt(item.price) <= value,
    );
    setSearchResults(filtered);
  };

  /**
   * Utiliser un élément de l'historique
   */
  const useHistoryItem = (text: string) => {
    handleSearch(text);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <StatusBar style="dark" />
      <View className="absolute top-0 left-0 right-0 z-50">
        <CustomStatusBar />
      </View>

      <View className="px-4 pt-6 mb-4">
        <BackButtonTwo title="Recherche" />
      </View>

      <View className="px-6">
        <SearchBar
          value={searchText}
          onChangeText={handleSearch}
          onSubmitEditing={() => handleSearchComplete(searchText)}
          onFilterPress={() => setShowFilter(!showFilter)}
        />
      </View>

      {!searchText ? (
        <View className="flex-1 px-6">
          <SearchHistory
            history={searchHistory}
            onHistoryItemSelect={useHistoryItem}
          />
          <PopularCuisines
            cuisines={popularCuisines}
            onCuisineSelect={handleSearch}
          />
        </View>
      ) : (
        <SearchResults results={searchResults} />
      )}

      {showFilter && (
        <View className="absolute bottom-0 left-0 right-0">
          <SearchFilter
            sortOptions={sortOptions}
            selectedSort={selectedSort}
            onSortChange={handleSortChange}
            sliderValue={sliderValue}
            onSliderChange={handleSliderChange}
            minPrice={2000}
            maxPrice={10000}
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default SearchScreen;
