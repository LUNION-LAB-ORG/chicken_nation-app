import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { menuItems } from "../data/MockedData";
import { MenuItem } from "@/types";

// Constantes
const HISTORY_LIMIT = 3;

/**
 * Hook personnalisé pour gérer la logique de recherche
 */
export const useSearch = (isAuthenticated: boolean) => {
  const [searchText, setSearchText] = useState<string>("");
  const [results, setResults] = useState<MenuItem[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [selectedSort, setSelectedSort] = useState<string>("Le plus proches");
  const [sliderValue, setSliderValue] = useState<number>(2000);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Charge l'historique des recherches au démarrage
  useEffect(() => {
    loadSearchHistory();
  }, []);

  // Applique les filtres lorsque les paramètres de tri ou le slider changent
  useEffect(() => {
    if (isAuthenticated && searchText.trim() !== "") {
      applyFilters(searchText);
    }
  }, [selectedSort, sliderValue, isAuthenticated]);

  /**
   * Charge l'historique des recherches depuis AsyncStorage
   */
  const loadSearchHistory = async (): Promise<void> => {
    try {
      const storedHistory = await AsyncStorage.getItem("searchHistory");
      if (storedHistory) {
        setSearchHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error(
        "Erreur lors du chargement de l'historique de recherche:",
        error,
      );
    }
  };

  /**
   * Sauvegarde l'historique des recherches dans AsyncStorage
   */
  const saveSearchHistory = async (history: string[]): Promise<void> => {
    try {
      await AsyncStorage.setItem("searchHistory", JSON.stringify(history));
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde de l'historique de recherche:",
        error,
      );
    }
  };

  /**
   * Ajoute une recherche à l'historique
   */
  const addToSearchHistory = (query: string): void => {
    if (query.trim() === "") return;

    const newHistory = searchHistory.filter((item) => item !== query);
    newHistory.unshift(query);
    const limitedHistory = newHistory.slice(0, HISTORY_LIMIT);

    setSearchHistory(limitedHistory);
    saveSearchHistory(limitedHistory);
  };

  /**
   * Applique les filtres de recherche aux données
   */
  const applyFilters = (searchQuery: string): void => {
    if (!isAuthenticated) {
      if (searchQuery.trim() !== "") {
        addToSearchHistory(searchQuery);
      }
      return;
    }

    let filtered = menuItems;

    // Filtre textuel
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.restaurant.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.categoryId.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      addToSearchHistory(searchQuery);
    }

    // Filtre de prix
    filtered = filtered.filter((item) => parseInt(item.price) <= sliderValue);

    // Appliquer le tri
    switch (selectedSort) {
      case "Prix croissant":
        filtered.sort((a, b) => parseInt(a.price) - parseInt(b.price));
        break;
      case "Prix décroissant":
        filtered.sort((a, b) => parseInt(b.price) - parseInt(a.price));
        break;
      case "Mieux notés":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    setResults(filtered);
    setShowResults(filtered.length > 0 || searchQuery.length > 0);
  };

  /**
   * Gère la saisie dans le champ de recherche
   */
  const handleSearch = (text: string): void => {
    setSearchText(text);

    if (text.length > 0 && !isAuthenticated) {
      setShowLoginModal(true);
      setShowResults(false);
    } else {
      applyFilters(text);
    }
  };

  /**
   * Utilise une recherche de l'historique
   */
  const useHistoryItem = (query: string): void => {
    setSearchText(query);

    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      applyFilters(query);
    }
  };

  /**
   * Gère le changement de l'option de tri
   */
  const handleSortChange = (option: string): void => {
    setSelectedSort(option);
  };

  /**
   * Gère le changement de la valeur du slider
   */
  const handleSliderChange = (value: number): void => {
    setSliderValue(value);
  };

  /**
   * Gère le toggle du filtre
   */
  const handleFilterToggle = (): void => {
    if (!isAuthenticated && searchText.trim() !== "") {
      setShowLoginModal(true);
    } else {
      setShowFilter(!showFilter);
    }
  };

  return {
    searchText,
    results,
    showResults,
    showLoginModal,
    showFilter,
    selectedSort,
    sliderValue,
    searchHistory,
    setShowLoginModal,
    setShowFilter,
    handleSearch,
    useHistoryItem,
    handleSortChange,
    handleSliderChange,
    handleFilterToggle,
  };
};

export default useSearch;
