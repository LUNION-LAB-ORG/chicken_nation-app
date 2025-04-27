import {
  ImageBackground,
  Text,
  View,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  FadeIn,
  SlideInRight,
} from "react-native-reanimated";
import { useOnboarding } from "../context/OnboardingContext";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { ScrollView } from "react-native";

/**
 * Écran d'authentification pour les utilisateurs incognitos
 * Affiche les options de connexion/inscription disponibles
 */
const GuestAuth: React.FC = () => {
  const { completeAuth, startAuthFlow, isFirstLaunch } = useOnboarding();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  // Valeurs pour les animations
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(100);

  /**
   * Configure les animations au montage du composant
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      // Animation d'apparition progressive
      opacity.value = withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.ease),
      });
      // Animation de translation horizontale
      translateX.value = withTiming(0, {
        duration: 600,
        easing: Easing.out(Easing.ease),
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log("[GuestAuth] isAuthenticated:", isAuthenticated);
    console.log("[GuestAuth] user:", user);
    if (isAuthenticated) {
      console.log("[GuestAuth] ATTENTION: L'utilisateur est authentifié mais voit l'écran GuestAuth !");
    }
  }, [isAuthenticated, user]);

  /**
   * Style animé pour le conteneur principal
   */
  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

 
  const handleSkip = (): void => {
    completeAuth();
    if (isFirstLaunch) {
      router.push("/onboarding/welcome");
    } else {
      router.push("/(tabs-guest)/");
    }
  };

  /**
   * Commence le flux d'authentification par email/téléphone
   */
  const handlePhoneAuth = (): void => {
    startAuthFlow();
    router.push("/(auth)/authwithphone");
  };

 

  return (
    <Animated.View className="flex-1 bg-white" entering={FadeIn.duration(600)}>
      <StatusBar style="light" />
      <ImageBackground
        source={require("../../assets/images/authbg.png")}
        style={{ flex: 1 }}
        className="w-[103%] h-[100%] absolute left-[-1%] flex-1"
      >
       <ScrollView showsVerticalScrollIndicator={false}>
       <View className="h-[35%]"></View>
        <View className="flex-1 justify-center px-6">
          {/* Titre et sous-titre */}
          <Text className="font-blocklyn-grunge text-[72px] mt-[45px] text-white text-start ">
            Bienvenue
          </Text>

          <Text className="font-urbanist-bold text-white text-start mb-6 text-paragraph">
            Vos plats préférés livrés {`\n`}rapidement à votre porte.
          </Text>

          <View className="w-full h-[2px] mt-[140px] bg-white/50 mb-3" />

          <Text className="font-urbanist-medium text-white text-center mb-8">
            Connexion ou inscription rapide et simple
          </Text>

          {/* Options d'authentification */}
          <View className="w-full space-y-4">
            {/* Email/Numéro */}
            <Animated.View entering={SlideInRight.delay(200).duration(500)}>
              <TouchableOpacity
                onPress={handlePhoneAuth}
                className="w-full border-[1px] mt-1 border-white bg-orange-500 p-4 py-5 mb-6 rounded-3xl flex-row items-center justify-center space-x-2"
                accessibilityLabel="Continuer avec email ou numéro"
              >
                <Text className="font-urbanist-medium text-white text-base">
                  Continuer avec un email un numéro
                </Text>
              </TouchableOpacity>
            </Animated.View>

        
            {/* Option pour ignorer */}
            <TouchableOpacity
              onPress={handleSkip}
              className="items-center justify-center"
              accessibilityLabel="Ignorer cette étape"
            >
              <Text className="font-urb anist-medium text-lg mt-4 text-gray-100">
                Ignorer cette étape
              </Text>
            </TouchableOpacity>
          </View>
        </View>
       </ScrollView>
      </ImageBackground>
    </Animated.View>
  );
};

export default GuestAuth;
