import { View, Text, Image, TouchableOpacity, Modal, ImageBackground, ScrollView, Dimensions } from "react-native";
import React, { useState } from "react";
import CartIndicator from "../ui/CartIndicator";
import { router } from "expo-router";

 
const HomeHeader: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { height } = Dimensions.get('window');

 
  const handleOpenMenu = (): void => {
    setShowLoginModal(true);
  };

  const handleCloseModal = (): void => {
    setShowLoginModal(false);
  };
 
  const handleEmailAuth = (): void => {
    setShowLoginModal(false);
    router.push("/(auth)/authwithphone");
  };

  /**
   * Redirige vers la page des menus
   */
  const handleMenus = (): void => {
    setShowLoginModal(false);
    router.push("/(tabs-guest)/menu");
  };

  const handleReservation = (): void => {
    setShowLoginModal(false);
    router.push("/(auth)/authwithphone");  
  };

  const handleRestaurants = (): void => {
    setShowLoginModal(false);
    router.push("/(common)/restaurants");  
  };

  return (
    <>
      <View className="flex flex-row items-center justify-between">
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

      {/* Modal de connexion */}
      <Modal
        visible={showLoginModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        {/* Overlay assombri */}
        <View style={{ 
          flex: 1, 
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0, 0, 0, 0.7)' 
        }}>
          {/* Conteneur du modal avec hauteur de 90% */}
          <View style={{ height: height * 0.85, backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            {/* En-tête du modal avec bouton de fermeture */}
            <View className="flex-row items-center justify-between p-4 bg-white" style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
              <TouchableOpacity onPress={handleCloseModal}>
                <Image
                  source={require("../../assets/icons/arrow-down.png")}
                  style={{ width: 24, height: 24, resizeMode: "contain" }}
                />
              </TouchableOpacity>
              <View className="items-center">
                <Image
                  source={require("../../assets/icons/long-logo.png")}
                  style={{ width: 177, height: 24, resizeMode: "contain" }}
                />
              </View>
              <View style={{ width: 24 }} />
            </View>

            <View style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <ScrollView>
                <ImageBackground source={require("../../assets/icons/bg-orange.png")} className="bg-orange-500 w-full">
                  <Text className="text-white text-center text-xl font-blocklyn-grunge py-3 uppercase">
                    Connecte-toi pour plus de fonctionnalités
                  </Text>
                  
                  <View className="items-center justify-center relative">
                    <Image
                      source={require("../../assets/images/loginbanner.png")}
                      style={{ width: 370, height: 130, resizeMode: "contain" }}
                    />
                  </View>
                  
                  <TouchableOpacity
                    onPress={handleEmailAuth}
                    className="bg-[#F17922] w-full py-3 items-center justify-center"
                  >
                    <Text className="text-white text-center font-urbanist-medium">
                      Connexion ou inscription rapide et simple
                    </Text>
                  </TouchableOpacity>
                </ImageBackground>

                {/* Options de menu avec espacement vertical augmenté */}
                <View className="p-6">
                  {/* Nos menus */}
                  <TouchableOpacity 
                    className="flex-row items-center py-4" 
                    onPress={handleMenus}
                  >
                    <Image
                      source={require("../../assets/icons/menu.png")}
                      style={{ width: 24, height: 24, marginRight: 16 }}
                    />
                    <Text className="text-gray-800 font-urbanist-medium text-lg">
                      Nos menus
                    </Text>
                  </TouchableOpacity>
                  
                  {/* Réserver une table */}
                  <TouchableOpacity 
                    className="flex-row items-center py-4" 
                    onPress={handleReservation}
                  >
                    <Image
                      source={require("../../assets/icons/table.png")}
                      style={{ width: 24, height: 24, marginRight: 16 }}
                    />
                    <Text className="text-gray-800 font-urbanist-medium text-lg">
                      Réserver une table
                    </Text>
                  </TouchableOpacity>
                  
                  {/* Nos restaurants */}
                  <TouchableOpacity 
                    className="flex-row items-center py-4" 
                    onPress={handleRestaurants}
                  >
                    <Image
                      source={require("../../assets/icons/resto.png")}
                      style={{ width: 24, height: 24, marginRight: 16 }}
                    />
                    <Text className="text-gray-800 font-urbanist-medium text-lg">
                      Nos restaurants
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
              
              {/* Version de l'application - fixée en bas */}
              <View className="bg-gray-100 p-4 items-center">
                <Text className="text-gray-500 font-urbanist-regular">
                  Version 1.0
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default HomeHeader;
