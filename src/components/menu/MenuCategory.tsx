import React from "react";
import { View, Text, Image } from "react-native";

/**
 * Props de l'en-tête de catégorie
 */
interface MenuCategoryProps {
  /** Titre de la catégorie à afficher */
  title: string;
}

/**
 * En-tête de catégorie dans le menu
 * Affiche le titre de catégorie avec une icône
 */
const MenuCategory: React.FC<MenuCategoryProps> = ({ title }) => {
  return (
    <View
      className="mt-4 mb-2 flex flex-row items-center gap-2"
      accessibilityRole="header"
      accessibilityLabel={`Catégorie: ${title}`}
    >
      <Image
        source={require("../../assets/icons/chicken.png")}
        style={{ width: 15, height: 15, resizeMode: "contain" }}
        accessibilityLabel="Icône Chicken Nation"
      />
      <Text className="text-lg text-start font-urbanist-medium text-orange-500">
        {title}
      </Text>
    </View>
  );
};

export default MenuCategory;
