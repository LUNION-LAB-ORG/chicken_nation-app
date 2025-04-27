import React, { useState, useEffect } from "react";
import { View, KeyboardAvoidingView, Platform, ActivityIndicator, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import BackButtonTwo from "@/components/ui/BackButtonTwo";
import SearchBar from "@/components/search/SearchBar";
import SearchHistory from "@/components/search/SearchHistory";
import SearchResults from "@/components/search/SearchResults";
import SearchFilter from "@/components/search/SearchFilter";
import PopularMenu from "@/components/search/PopularMenu";
import { useAuth } from "@/app/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/services/api/api"; 
import { formatMenuFromApi } from "@/services/menuService"; 
import { MenuItem } from "@/types";

const sortOptions = [
  "Le plus proches",
  "Prix croissant",
  "Prix décroissant",
  "Mieux notés",
];

 

const MAX_HISTORY_ITEMS = 4; // Limite à 4 recherches récentes

const SearchScreen = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
  const [searchResults, setSearchResults] = useState<MenuItem[]>([]);
  const [searchText, setSearchText] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedSort, setSelectedSort] = useState("");
  const [sliderValue, setSliderValue] = useState(2000);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger l'historique au démarrage
  useEffect(() => {
    loadSearchHistory();
    loadMenus();
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
   * Charge les menus depuis l'API
   */
  const loadMenus = async () => {
    try {
      setLoading(true);
      
      // Tenter de récupérer le token, mais ne pas exiger l'authentification
      let token = '';
      try {
        const authData = await AsyncStorage.getItem('access_token');
        if (authData) {
          token = JSON.parse(authData);
        }
      } catch (authError) {
        // Continuer sans authentification
      }
      
      // Appel direct à l'API pour éviter le cache du service
      const response = await api.get('/v1/dishes', {
        headers: token ? {
          Authorization: `Bearer ${token}`
        } : {}
      });
      
      // Vérifier si les données sont dans un champ 'data'
      const menus = response.data.data || response.data || [];
      
      // Formater les menus pour correspondre au type MenuItem
      const formattedMenus = Array.isArray(menus) 
        ? menus.map((menu: any) => formatMenuFromApi(menu))
        : [];
      
      if (formattedMenus.length > 0) {
        // Mettre à jour l'état avec tous les menus disponibles
        setAllMenuItems(formattedMenus);
        setSearchResults(formattedMenus);
      } else {
        // Si aucun menu n'est trouvé, afficher un tableau vide
        setAllMenuItems([]);
        setSearchResults([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des menus:", error);
      setLoading(false);
      // En cas d'erreur, afficher un tableau vide
      setAllMenuItems([]);
      setSearchResults([]);
    }
  };

  /**
   * Gestionnaire de recherche amélioré
   * Filtre les résultats en temps réel mais ne sauvegarde pas dans l'historique
   */
  const handleSearch = (text: string) => {
    setSearchText(text);

    if (!text.trim()) {
      // Réinitialiser les résultats de recherche en utilisant tous les menus disponibles
      setSearchResults(allMenuItems);
      return;
    }

    // Normalisation du texte de recherche (minuscules, sans accents)
    const normalizedSearchText = text.toLowerCase().trim();
    
    // Diviser la recherche en mots-clés individuels pour une recherche plus précise
    const keywords = normalizedSearchText.split(/\s+/).filter(keyword => keyword.length > 1);
    
    // Filtrage des résultats avec une recherche plus souple
    let filtered = allMenuItems.filter((item) => {
      // Si aucun mot-clé n'est trouvé (recherche trop courte), utiliser le texte complet
      if (keywords.length === 0) {
        return matchesSearchTerm(item, normalizedSearchText);
      }
      
      // Sinon, vérifier chaque mot-clé individuellement
      // Un élément correspond si au moins un mot-clé correspond
      return keywords.some(keyword => matchesSearchTerm(item, keyword));
    });

    // Appliquer les filtres existants
    if (selectedSort) {
      filtered = sortResults(filtered, selectedSort);
    }
    
    // Filtrer par prix
    filtered = filtered.filter((item) => {
      // Gestion sécurisée du prix qui peut être de différents types
      let priceValue = 0;
      if (typeof item.price === 'number') {
        priceValue = item.price;
      } else if (typeof item.price === 'string') {
        priceValue = parseInt(item.price);
      } else if (item.price) {
        // Fallback si le prix existe mais n'est pas d'un type attendu
        try {
          priceValue = parseInt(String(item.price));
        } catch (e) {
          // Si la conversion échoue, on utilise 0
          priceValue = 0;
        }
      }
      return !isNaN(priceValue) && priceValue <= sliderValue;
    });

    setSearchResults(filtered);
  };

  /**
   * Vérifie si un élément de menu correspond à un terme de recherche
   */
  const matchesSearchTerm = (item: MenuItem, term: string): boolean => {
    // Vérifier le nom du produit (priorité élevée)
    if (item.name?.toLowerCase().includes(term)) {
      return true;
    }
    
    // Vérifier la description du produit
    if (item.description?.toLowerCase().includes(term)) {
      return true;
    }
    
    // Vérifier le restaurant
    if (item.restaurant?.toLowerCase().includes(term)) {
      return true;
    }
    
    // Vérifier les ingrédients (si disponibles)
    if (item.ingredients?.some(ingredient => ingredient.toLowerCase().includes(term))) {
      return true;
    }
    
    // Vérifier la catégorie (si disponible)
    if (item.categoryId?.toLowerCase().includes(term)) {
      return true;
    }
    
    return false;
  };

  /**
   * Gestionnaire de recherche complète
   * Sauvegarde la recherche dans l'historique
   */
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

  const sortResults = (results: MenuItem[], sort: string) => {
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
    
    if (!searchText.trim()) {
      // Si aucun texte de recherche, filtrer tous les menus par prix uniquement
      const filtered = allMenuItems.filter((item) => {
        // Gestion sécurisée du prix qui peut être de différents types
        let priceValue = 0;
        if (typeof item.price === 'number') {
          priceValue = item.price;
        } else if (typeof item.price === 'string') {
          priceValue = parseInt(item.price);
        } else if (item.price) {
          try {
            priceValue = parseInt(String(item.price));
          } catch (e) {
            priceValue = 0;
          }
        }
        return !isNaN(priceValue) && priceValue <= value;
      });
      setSearchResults(filtered);
    } else {
      // Si un texte de recherche existe, appliquer à la fois le filtre de texte et de prix
      handleSearch(searchText);
    }
  };

  /**
   * Utiliser un élément de l'historique
   */
  const useHistoryItem = (text: string) => {
    handleSearch(text);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

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
          <PopularMenu
            onMenuSelect={(menuId) => router.push(`/(common)/products/${menuId}`)}
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
