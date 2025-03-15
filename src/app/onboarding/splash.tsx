import { View, Image, Dimensions } from "react-native";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  withSequence,
  useAnimatedStyle,
} from "react-native-reanimated";
import Spinner from "@/components/ui/Spinner";

// Constantes pour les animations et le dimensionnement
const { width } = Dimensions.get("window");
const SPINNER_SIZE = width * 0.13;
const ANIMATION_DURATION = 4000; 

/**
 * Écran de démarrage (splash screen)
 * Affiche le logo et un indicateur de chargement
 */
const Splash: React.FC = () => {
  // Valeurs partagées pour les animations
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Timer avec animation de sortie
    const timer = setTimeout(() => {
      // Animation de disparition progressive
      opacity.value = withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      });

      // Animation de scale avec séquence d'agrandissement puis réduction
      scale.value = withSequence(
        withTiming(1.1, {
          duration: 300,
          easing: Easing.out(Easing.ease),
        }),
        withTiming(0, {
          duration: 200,
          easing: Easing.in(Easing.ease),
        }),
      );
    }, ANIMATION_DURATION);

    return () => clearTimeout(timer);
  }, []);

 
  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <>
      <StatusBar style="light" />
      <Animated.View
        className="flex-1 items-center justify-center bg-white"
        style={containerStyle}
      >
        {/* Image de fond */}
        <Image
          source={require("../../assets/images/splash.png")}
          className="w-[103%] h-[100%] absolute left-[-1%] flex-1"
          accessibilityLabel="Image de fond du splash screen"
        />

        {/* Indicateur de chargement */}
        <View
          style={{
            position: "absolute",
            bottom: 300,
            alignItems: "center",
            justifyContent: "center",
          }}
          accessibilityLabel="Indicateur de chargement"
        >
          <Spinner size={SPINNER_SIZE} />
        </View>
      </Animated.View>
    </>
  );
};

export default Splash;
