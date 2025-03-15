import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";

interface PopularCuisinesProps {
  cuisines: string[];
  onCuisineSelect: (cuisine: string) => void;
}

/**
 * Composant pour afficher les catégories de cuisine populaires
 */
const PopularCuisines: React.FC<PopularCuisinesProps> = ({
  cuisines,
  onCuisineSelect,
}) => {
  return (
    <View className="mt-5">
      <View className="items-center flex-row mb-8">
        <Image
          source={require("../../assets/icons/chicken.png")}
          style={{ width: 16, height: 16, resizeMode: "contain" }}
        />
        <Text className="text-lg font-urbanist-medium ml-2 text-orange-500">
          Popular Cuisines
        </Text>
      </View>
      <View className="flex-row flex-wrap gap-4">
        {cuisines.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => onCuisineSelect(item)}
            className="border border-orange-400 rounded-full px-4 py-2"
          >
            <Text className="text-orange-400 font-urbanist-medium">{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default PopularCuisines;
