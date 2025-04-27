import React from "react";
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import CustomStatusBarWithHeader from "@/components/ui/CustomStatusBarWithHeader";

/**
 * Écran de connexion
 * Permet à l'utilisateur de se connecter ou de s'inscrire via différentes méthodes
 */
const LoginScreen: React.FC = () => {
  /**
   * Redirige vers l'écran d'authentification par email/téléphone
   */
  const handleEmailAuth = (): void => router.push("/(auth)/authwithphone");

  return (
    <View className="flex-1 bg-white">
      {/* Barre d'état personnalisée avec logo */}
      <CustomStatusBarWithHeader />

      <View className="mt-32">
        {/* Bannière et texte d'invite */}
        <ImageBackground
          source={require("../../assets/images/sliderbackground.png")}
          className="w-full h-56"
        >
          <Text className="text-lg font-blocklyn-grunge text-white uppercase text-center my-6">
            Connecte-toi pour plus de fonctionnalités
          </Text>

          <View className="w-full relative mb-6">
            <Image
              source={require("../../assets/images/loginbanner.png")}
              className="absolute -top-[89px] left-1/2 w-[370px] h-[300px] z-10"
              style={{
                resizeMode: "contain",
                transform: [{ translateX: -160 }],
              }}
            />
          </View>
        </ImageBackground>

        {/* Bouton principal de connexion */}
        <TouchableOpacity
          onPress={handleEmailAuth}
          className="bg-orange-600 w-full h-14 z-20 items-center justify-center"
        >
          <Text className="text-base font-sofia-light text-white text-center my-4">
            Connexion ou inscription rapide et simple
          </Text>
        </TouchableOpacity>

        {/* Options supplémentaires de connexion */}
        <View className="px-6">
          <TouchableOpacity
            onPress={handleEmailAuth}
            className="bg-white border-[1px] border-orange-500 p-4 mt-10 rounded-3xl"
          >
            <Text className="text-lg font-urbanist-medium text-center text-orange-500">
              Connexion avec email ou un numéro
            </Text>
          </TouchableOpacity>

      
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;
