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

/**
 * Écran d'authentification pour les utilisateurs incognitos
 * Affiche les options de connexion/inscription disponibles
 */
const GuestAuth: React.FC = () => {
  const { completeAuth, startAuthFlow, isFirstLaunch } = useOnboarding();
  const router = useRouter();

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

  /**
   * Style animé pour le conteneur principal
   */
  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  /**
   * Ignore l'authentification et passe à l'écran de bienvenue si premier lancement,
   * sinon va directement aux tabs invités
   */
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
  const handleEmailAuth = (): void => {
    startAuthFlow();
    router.push("/(auth)/authwithemail");
  };

  /**
   * Commence le flux d'authentification avec Google
   */
  const handleGoogleAuth = (): void => {
    startAuthFlow();
    router.push("/(auth)/google");
  };

  /**
   * Commence le flux d'authentification avec Facebook
   */
  const handleFacebookAuth = (): void => {
    startAuthFlow();
    router.push("/(auth)/facebook");
  };

  return (
    <Animated.View className="flex-1 bg-white" entering={FadeIn.duration(600)}>
      <StatusBar style="light" />
      <ImageBackground
        source={require("../../assets/images/authbg.png")}
        style={{ flex: 1 }}
        className="w-[103%] h-[100%] absolute left-[-1%] flex-1"
      >
        <View className="h-[35%]"></View>
        <View className="flex-1 justify-center h-[65%] mt-20 px-6">
          {/* Titre et sous-titre */}
          <Text className="font-blocklyn-grunge text-[72px] text-white text-start ">
            Bienvenue
          </Text>

          <Text className="font-urbanist-bold text-white text-start mb-6 text-paragraph">
            Vos plats préférés livrés {`\n`}rapidement à votre porte.
          </Text>

          <View className="w-full h-[2px] bg-white/50 mb-3" />

          <Text className="font-urbanist-medium text-white text-center mb-8">
            Connexion ou inscription rapide et simple
          </Text>

          {/* Options d'authentification */}
          <View className="w-full space-y-4">
            {/* Email/Numéro */}
            <Animated.View entering={SlideInRight.delay(200).duration(500)}>
              <TouchableOpacity
                onPress={handleEmailAuth}
                className="w-full border-[1px] mt-1 border-white bg-orange-500 p-4 py-5 mb-6 rounded-3xl flex-row items-center justify-center space-x-2"
                accessibilityLabel="Continuer avec email ou numéro"
              >
                <Text className="font-urbanist-medium text-white text-base">
                  Continuer avec un email un numéro
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Google */}
            <Animated.View entering={SlideInRight.delay(400).duration(500)}>
              <TouchableOpacity
                onPress={handleGoogleAuth}
                className="w-full bg-white p-4 mb-6 py-5 rounded-3xl flex-row items-center justify-center space-x-2"
                accessibilityLabel="Continuer avec Google"
              >
                <Image
                  source={require("../../assets/icons/google.png")}
                  className="w-8 h-8 mr-4"
                  style={{ resizeMode: "contain" }}
                  accessibilityLabel="Logo Google"
                />
                <Text className="font-urbanist-medium text-black text-base">
                  Continuer avec Google
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Facebook */}
            <Animated.View entering={SlideInRight.delay(600).duration(500)}>
              <TouchableOpacity
                onPress={handleFacebookAuth}
                className="w-full bg-white p-4 py-5 rounded-3xl flex-row items-center justify-center space-x-2"
                accessibilityLabel="Continuer avec Facebook"
              >
                <Image
                  source={require("../../assets/icons/facebook.png")}
                  className="w-8 h-8 mr-4"
                  style={{ resizeMode: "contain" }}
                  accessibilityLabel="Logo Facebook"
                />
                <Text className="font-urbanist-medium text-black text-base">
                  Continuer avec Facebook
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Option pour ignorer */}
            <TouchableOpacity
              onPress={handleSkip}
              className="items-center justify-center"
              accessibilityLabel="Ignorer cette étape"
            >
              <Text className="font-urbanist-medium text-lg mt-4 text-gray-100">
                Ignorer cette étape
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </Animated.View>
  );
};

export default GuestAuth;
