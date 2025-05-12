import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import {
  Heart, 
  Settings, 
} from "lucide-react-native";
import { useAuth } from "@/app/context/AuthContext";
import ConfirmLogoutModal from "./ConfirmLogoutModal";
import useCartStore from "@/store/cartStore";
import { formatImageUrl } from "@/utils/imageHelpers";

interface BottomSheetModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const BottomSheetModal: React.FC<BottomSheetModalProps> = ({
  isVisible,
  onClose,
}) => {
  const { user, logout } = useAuth();
  const clearCart = useCartStore((state) => state.clearCart);
  const [showConfirmLogout, setShowConfirmLogout] = React.useState(false);

  const menuItems = [
    {
      icon: (
        <Image
          source={require("../../assets/icons/drawer/menu.png")}
          style={{ width: 24, height: 24, resizeMode: "contain" }}
        />
      ),
      title: "Nos menus",
      route: "/(tabs-user)/menu",
    },
    {
      icon: (
        <Image
          source={require("../../assets/icons/drawer/reservation.png")}
          style={{ width: 24, height: 24, resizeMode: "contain" }}
        />
      ),
      title: "Réserver une table",
      route: "/(authenticated-only)/reservation",
    },
    {
      icon: (
        <Image
          source={require("../../assets/icons/drawer/restaurant.png")}
          style={{ width: 24, height: 24, resizeMode: "contain" }}
        />
      ),
      title: "Nos restaurants",
      route: "/(common)/restaurants",
    },
    {
      icon: (
        <Image
          source={require("../../assets/icons/drawer/commande.png")}
          style={{ width: 24, height: 24, resizeMode: "contain" }}
        />
      ),
      title: "Mes commandes",
      route: "/(authenticated-only)/orders",
    }, 
    {
      icon: (
        <Image
          source={require("../../assets/icons/drawer/offre.png")}
          style={{ width: 24, height: 24, resizeMode: "contain" }}
        />
      ),
      title: "Offres spéciales",
      route: "/(tabs-user)/special-offers",
    },
    {
      icon: <Heart size={24} color="#595959" />,
      title: "Mes favoris",
      route: "/(authenticated-only)/favorites",
    },
    {
      icon: (
        <Image
          source={require("../../assets/icons/drawer/notification.png")}
          style={{ width: 24, height: 24, resizeMode: "contain" }}
        />
      ),
      title: "Notifications",
      route: "/(authenticated-only)/notifications",
    },
    {
      icon: (
        <Image
          source={require("../../assets/icons/drawer/aide.png")}
          style={{ width: 24, height: 24, resizeMode: "contain" }}
        />
      ),
      title: "Centre d'aide",
      route: "/(authenticated-only)/help",
    },
    {
      icon: (
        <Image
          source={require("../../assets/icons/drawer/amis.png")}
          style={{ width: 24, height: 24, resizeMode: "contain" }}
        />
      ),
      title: "Inviter un ami",
      route: "/(authenticated-only)/invite-friend",
    },
    {
      icon: <Settings size={24} color="#595959" />,
      title: "Paramètres",
      route: "/(authenticated-only)/settings",
    },
  ];

  const handleNavigation = (route: string) => {
    onClose();
    router.push(route as any);
  };

  const handleLogout = async () => {
    setShowConfirmLogout(true);
  };

  const confirmLogout = async () => {
    setShowConfirmLogout(false);
    await logout();
    await clearCart();
    onClose();
    router.replace("(auth)/authwithphone");
  };

  const cancelLogout = () => {
    setShowConfirmLogout(false);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      style={{ backgroundColor: "#fff" }}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl px-2">
          {/* En-tête avec bouton de fermeture */}
          <View className="p-6 relative">
            <View className="flex flex-row items-center justify-between">
              <TouchableOpacity onPress={onClose}>
                <Image
                  source={require("../../assets/icons/arrow-down.png")}
                  style={{ width: 30, height: 30, resizeMode: "contain" }}
                />
              </TouchableOpacity>
              <View style={styles.logoContainer} className="flex-row mt-1">
                <Image
                  source={require("../../assets/icons/long-logo.png")}
                  style={styles.logo}
                />
              </View>
              <View />
            </View>
          </View>
          <View className="flex-row items-center mt-6 ml-4">
            <Image
              source={
                user?.image
                  ? { uri: formatImageUrl(user.image) }
                  : require("../../assets/icons/default-avatar.png")
              }
              className="w-16 h-16 rounded-full"
              style={{ resizeMode: "cover" }}
            />
            <View className="ml-3">
              <Text className="text-gray-900 text-xl font-sofia-medium">
                {user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : "User name"}
              </Text>
              <Text className="text-gray-500 text-sm">
               {user?.phone || ""}
              </Text>
            </View>
          </View>
        </View>

        {/* Liste des éléments du menu */}
        <ScrollView className="max-h-[600px] bg-white">
          <View className="py-4">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                className="flex-row items-center px-6 py-4 active:bg-gray-50"
                onPress={() => handleNavigation(item.route)}
              >
                {item.icon}
                <Text className="ml-4 -mt-1 text-xl text-gray-900 font-sofia-regular">
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Bouton de déconnexion */}
        <View className="p-6 pb-4 bg-white">
          <TouchableOpacity
            className="bg-[#FFB800] rounded-3xl py-4 items-center flex-row justify-center"
            onPress={handleLogout}
          >
            <Image
              source={require("../../assets/icons/logout.png")}
              style={{ width: 24, height: 24, resizeMode: "contain" }}
            />
            <Text className="ml-2 text-black font-sofia-medium">
              Déconnexion
            </Text>
          </TouchableOpacity>
        </View>
        <ConfirmLogoutModal
          visible={showConfirmLogout}
          onConfirm={confirmLogout}
          onCancel={cancelLogout}
        />
      </View>

      {/* Section version en dehors du padding principal, avec fond slate-100 */}
      <View className="bg-slate-100 py-6 px-6 items-center">
        <Text className="text-slate-500 font-sofia-regular text-sm">
          Version 1.0
        </Text>
      </View>
    </Modal>
  );
};

export default BottomSheetModal;

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 185,
    height: 24,
  },
});
