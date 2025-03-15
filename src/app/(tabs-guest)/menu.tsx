import { View, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import MenuCategory from "@/components/menu/MenuCategory";
import MenuItem from "@/components/menu/MenuItem";
import CategoryList from "@/components/menu/CategoryList";
import HomeLocation from "@/components/home/HomeLocation";
import HomeSearchBar from "@/components/home/HomeSearchBar";
import MenuBanner from "@/components/menu/MenuBanner";
import { menuItems, categories } from "@/data/MockedData";
import CustomStatusBarWithHeader from "@/components/ui/CustomStatusBarWithHeader";
import { useLocalSearchParams } from "expo-router";

/**
 * Écran du menu pour les utilisateurs invités
 * Affiche la liste des catégories et les menus correspondants
 */
const Menu: React.FC = () => {
  // Récupération du paramètre de catégorie  
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    categories[0].id,
  );

  // Mettre à jour la catégorie sélectionnée si un paramètre est fourni
  useEffect(() => {
    if (categoryId) {
      setSelectedCategoryId(categoryId);
    }
  }, [categoryId]);

  // Filtrer les éléments du menu par catégorie sélectionnée
  const filteredMenuItems = menuItems.filter(
    (item) => item.categoryId === selectedCategoryId,
  );

  // Trouver la catégorie sélectionnée pour afficher son nom
  const selectedCategory = categories.find(
    (cat) => cat.id === selectedCategoryId,
  );

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
        </View>
      </ScrollView>
    </View>
  );
};

export default Menu;
