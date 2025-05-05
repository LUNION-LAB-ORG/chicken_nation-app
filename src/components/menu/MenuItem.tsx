import { router } from "expo-router";
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";

/**
 * Props pour le composant MenuItem
 */
interface MenuItemProps {
  /** ID unique du produit */
  id: string;
  /** Nom du produit */
  name: string;
  /** Prix affiché du produit (format chaîne, ex: "6000 FCFA") */
  price: string;
  /** Marqueur "NOUVEAU" si applicable */
  isNew?: string;
  /** Image du produit */
  image?: any;
  /** Description courte du produit */
  description?: string;
}

  
const MenuItem: React.FC<MenuItemProps> = ({
  id,
  name,
  price,
  isNew,
  image,
  description,
}) => {
  /**
   * Redirige vers l'écran détaillée du menu
   */
  const handlePress = (): void => {
    router.push({
      pathname: "/(common)/products/[productId]",
      params: { productId: id },
    });
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="flex-row items-center p-4 border-b border-gray-200"
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${price}${isNew ? ", Nouveau produit" : ""}`}
      accessibilityHint="Appuyez pour voir les détails du produit"
    >
      <Image
        source={typeof image === 'string' ? { uri: image } : image}
        className="w-[100px] h-[100px] rounded-3xl border-[1px] border-slate-100"
        accessibilityLabel={`Image de ${name}`}
        style={{ resizeMode: "contain" }}
      />
      <View className="ml-4 flex-1">
        {isNew && (
          <View className="bg-yellow rounded-lg px-2 py-1 self-start mb-1">
            <Text className="text-xs font-urbanist-bold text-black">
              {isNew}
            </Text>
          </View>
        )}
        <Text className="text-lg font-sofia-medium mb-1">{name}</Text>
        {description && (
          <Text className="text-sm text-gray-500 font-sofia-light mb-1">
            {description}
          </Text>
        )}
        <Text className="text-md text-orange-500 font-sofia-medium">
          {price}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default MenuItem;
