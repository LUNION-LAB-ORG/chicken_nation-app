import { View, ScrollView, Text, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import MenuCategory from "@/components/menu/MenuCategory";
import MenuItem from "@/components/menu/MenuItem";
import CategoryList from "@/components/menu/CategoryList";
import HomeLocation from "@/components/home/HomeLocation";
import HomeSearchBar from "@/components/home/HomeSearchBar";
import MenuBanner from "@/components/menu/MenuBanner";
import { getAllMenus } from "@/services/menuService";
import { getAllCategories } from "@/services/categoryService";
import { MenuItem as MenuItemType, Category } from "@/types";
import CustomStatusBarWithHeader from "@/components/ui/CustomStatusBarWithHeader";
import { useLocalSearchParams } from "expo-router";

/**
 * Écran du menu pour les utilisateurs invités
 * Affiche la liste des catégories et les menus correspondants
 * Utilise les mêmes services API que la version utilisateur
 */
const Menu: React.FC = () => {
  // Récupération du paramètre de catégorie  
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // Charger les données depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Récupérer les catégories
        let categoriesData;
        try {
          categoriesData = await getAllCategories();
          
          if (!categoriesData || categoriesData.length === 0) {
            setError("Aucune catégorie disponible pour le moment.");
          } else {
            setCategories(categoriesData);
            
            // Sélectionner la première catégorie par défaut ou celle spécifiée dans l'URL
            if (categoriesData.length > 0) {
              if (categoryId) {
                setSelectedCategoryId(categoryId);
              } else {
                setSelectedCategoryId(categoriesData[0].id);
              }
            }
          }
        } catch (catError) {
          console.error("Erreur lors du chargement des catégories:", catError);
          setError("Impossible de charger les catégories. Veuillez réessayer plus tard.");
          categoriesData = [];
        }
        
        // Récupérer les menus
        try {
          const menuData = await getAllMenus();
          
          if (menuData && menuData.length > 0) {
            setMenuItems(menuData);
          } else {
            setError("Aucun menu disponible pour le moment.");
          }
        } catch (menuError) {
          console.error("Erreur lors du chargement des menus:", menuError);
          setError("Impossible de charger les menus. Veuillez réessayer plus tard.");
        }
        
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError(`Impossible de charger les données: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [categoryId]);

  // Mettre à jour la catégorie sélectionnée si un paramètre est fourni
  useEffect(() => {
    if (categoryId && categories.length > 0) {
      setSelectedCategoryId(categoryId);
    }
  }, [categoryId, categories]);

  // Filtrer les éléments du menu par catégorie sélectionnée
  const filteredMenuItems = menuItems.filter(
    (item) => item.categoryId === selectedCategoryId
  );

  // Trouver la catégorie sélectionnée pour afficher son nom
  const selectedCategory = categories.find(
    (cat) => cat.id === selectedCategoryId
  );

  // Afficher un indicateur de chargement
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <CustomStatusBarWithHeader />
        <ActivityIndicator size="large" color="#F97316" />
        <Text className="mt-4 text-gray-600 font-urbanist-medium">Chargement du menu...</Text>
      </View>
    );
  }

  // Afficher un message d'erreur si nécessaire
  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-4">
        <CustomStatusBarWithHeader />
        <Text className="text-red-500 font-urbanist-bold text-lg mb-2">Erreur</Text>
        <Text className="text-gray-600 font-urbanist-medium text-center">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 relative bg-white">
      <CustomStatusBarWithHeader />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 50 }}
      >
        <View className="px-6 mt-6">
          <HomeSearchBar />
          <HomeLocation />
          <MenuBanner />

          {/* Liste des catégories avec sélection */}
          <CategoryList
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />

          {/* En-tête de la catégorie sélectionnée */}
          {selectedCategory && <MenuCategory title={selectedCategory.name} />}

          {/* Liste des plats de la catégorie sélectionnée */}
          {filteredMenuItems.map((item) => (
            <MenuItem
              key={item.id}
              id={item.id}
              name={item.name}
              price={`${item.price} FCFA`}
              image={item.image}
              isNew={item.isNew ? "NOUVEAU" : undefined}
              description={item.description}
            />
          ))}

          {/* Message si aucun plat n'est disponible dans cette catégorie */}
          {filteredMenuItems.length === 0 && selectedCategory && (
            <View className="py-8 items-center">
              <Text className="text-gray-500 font-urbanist-medium text-center">
                Aucun plat disponible dans cette catégorie pour le moment.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default Menu;
