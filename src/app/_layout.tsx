import "../global.css";
import { Slot } from "expo-router";
import { AuthProvider } from "./context/AuthContext";
import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import OnboardingProvider from "./context/OnboardingContext";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { customFonts } from "../utils/fonts";
import { LocationProvider } from "./context/LocationContext";

// Maintient l'écran de démarrage visible pendant le chargement des ressources
SplashScreen.preventAutoHideAsync();

// Fonction principale de layout qui initialise les providers
export default function Layout() {
  const [fontsLoaded] = useFonts(customFonts);
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Simule un court délai de chargement
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady && fontsLoaded) {
      // Cache l'écran de démarrage natif une fois que tout est prêt
      SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);

  if (!appIsReady || !fontsLoaded) {
    return null;
  }

  // Wraps toute l'application avec les providers nécessaires
  return (
    <OnboardingProvider>
      <AuthProvider>
        <LocationProvider>
          <View style={StyleSheet.absoluteFill}>
            <Slot />
          </View>
        </LocationProvider>
      </AuthProvider>
    </OnboardingProvider>
  );
}
