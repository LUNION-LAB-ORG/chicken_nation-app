import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

/**
 * Barre de recherche sur la page d'accueil
 * Version non interactive qui redirige vers l'écran de recherche
 */
const HomeSearchBar: React.FC = () => {
  const router = useRouter();

  /**
   * Redirige vers l'écran de recherche
   */
  const handleSearchPress = (): void => {
    router.push("/search");
  };

  return (
    <View className="mt-12">
      <TouchableOpacity
        onPress={handleSearchPress}
        className="w-full h-[50px] bg-white border-[1px] border-[#9796A1] rounded-full flex flex-row items-center justify-between px-4"
        accessibilityLabel="Rechercher des plats"
        accessibilityRole="search"
      >
        <View className="flex-row items-center flex-1 mr-3">
          <Image
            source={require("../../assets/icons/search.png")}
            style={{ width: 24, height: 24, resizeMode: "contain" }}
            accessibilityLabel="Icône de recherche"
          />
          <Text className="ml-3 text-[14px] text-[#9796A1] font-sofia-light flex-1">
            trouver un truc à grignoter
          </Text>
        </View>
        <View>
          <Image
            source={require("../../assets/icons/filter.png")}
            style={{ width: 24, height: 24, resizeMode: "contain" }}
            accessibilityLabel="Icône de filtre"
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default HomeSearchBar;
