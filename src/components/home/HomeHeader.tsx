import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import CartIndicator from "../ui/CartIndicator";
import { router } from "expo-router";

/**
 * En-tête de la page d'accueil
 * Contient le logo, un bouton menu et l'indicateur du panier
 */
const HomeHeader: React.FC = () => {
  /**
   * Gère la navigation vers l'écran de connexion
   */
  const handleOpenMenu = (): void => {
    router.push("(tabs-guest)/login");
  };

  return (
    <View className="flex flex-row items-center justify-between">
      {/* Bouton menu (redirige vers la connexion pour les invités) */}
      <TouchableOpacity
        onPress={handleOpenMenu}
        accessibilityLabel="Menu principal"
        accessibilityRole="button"
      >
        <Image
          source={require("../../assets/icons/drawer.png")}
          style={{ width: 24, height: 24, resizeMode: "contain" }}
          accessibilityLabel="Icône de menu"
        />
      </TouchableOpacity>

      {/* Logo de l'application */}
      <View>
        <Image
          source={require("../../assets/icons/long-logo.png")}
          style={{ width: 177, height: 24, resizeMode: "contain" }}
          accessibilityLabel="Logo Chicken Nation"
        />
      </View>

      {/* Indicateur du panier avec nombre d'articles */}
      <CartIndicator />
    </View>
  );
};

export default HomeHeader;
