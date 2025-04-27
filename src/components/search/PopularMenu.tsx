import React from "react";
import { View, Text, TouchableOpacity, Image, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { MenuItem } from "@/types";
import { getAllMenus } from "@/services/menuService";

interface PopularMenuProps {
  onMenuSelect: (menuId: string) => void;
}

/**
 * Composant pour afficher les menus populaires
 */
const PopularMenu: React.FC<PopularMenuProps> = ({
  onMenuSelect,
}) => {
  const [menus, setMenus] = React.useState<MenuItem[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    const loadMenus = async () => {
      try {
        const allMenus = await getAllMenus();
        // Prendre les 6 premiers menus pour simuler les menus populaires
        setMenus(allMenus.slice(0, 6));
      } catch (error) {
        // Gérer silencieusement les erreurs
        console.error("Erreur lors du chargement des menus populaires:", error);
      }
    };

    loadMenus();
  }, []);

  const handleMenuPress = (menuId: string) => {
    if (onMenuSelect) {
      onMenuSelect(menuId);
    } else {
      router.push(`/(common)/products/${menuId}`);
    }
  };

  return (
    <View className="mt-5">
      <View className="items-center flex-row mb-8">
        <Image
          source={require("../../assets/icons/chicken.png")}
          style={{ width: 16, height: 16, resizeMode: "contain" }}
        />
        <Text className="text-lg font-urbanist-medium ml-2 text-orange-500">
          Menus Populaires
        </Text>
      </View>
      <View className="flex-row flex-wrap gap-4">
        {menus.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => handleMenuPress(item.id)}
            className="border border-orange-400 rounded-full px-4 py-2"
          >
            <Text className="text-orange-400 font-urbanist-medium">{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default PopularMenu;
