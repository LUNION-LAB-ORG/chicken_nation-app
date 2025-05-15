import React from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/app/context/AuthContext";

/**
 * Props du composant CartTabBar
 */
interface CartTabBarProps {
  /** Action supplémentaire à effectuer lors du clic */
  onPress?: () => void;
}

 
const CartTabBar: React.FC<CartTabBarProps> = ({ onPress }) => {
  const { user } = useAuth();  
  const router = useRouter();

  const handleNavigateToMenu = () => {
    const route = user ? "/(tabs-user)/menu" : "/(tabs-guest)/menu";
    router.push({
      pathname: route,
    });
  };

  /**
   * Gère la navigation vers l'écran du menu
   */

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.tabButton}
        onPressIn={handleNavigateToMenu}
      >
        <Image
          source={require("../../assets/icons/menu.png")}
          style={styles.tabIcon}
        />
        <Text style={styles.tabText}>Menu</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIcon: {
    width: 24,
    height: 24,
    tintColor: "#F17922",
    resizeMode: "contain",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
    color: "#F17922",
    fontFamily: "Urbanist-Medium",
  },
});

export default CartTabBar;
