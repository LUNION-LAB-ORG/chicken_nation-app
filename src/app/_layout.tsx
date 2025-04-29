import "../global.css";
import RootNavigator from "./RootNavigator";
import { AuthProvider } from "./context/AuthContext";
import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import OnboardingProvider from "./context/OnboardingContext";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { customFonts } from "../utils/fonts";
import { LocationProvider } from "./context/LocationContext";
import useCartStore from "@/store/cartStore";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [fontsLoaded] = useFonts(customFonts);
  const [appIsReady, setAppIsReady] = useState(false);

  // Initialisation du panier au démarrage de l'app
  useEffect(() => {
    useCartStore.getState().initializeCart();
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
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
      SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);

  if (!appIsReady || !fontsLoaded) {
    return null; // SplashScreen ou loader custom si besoin
  }

  return (
    <OnboardingProvider>
      <AuthProvider>
        <LocationProvider>
          <View style={StyleSheet.absoluteFill}>
            <RootNavigator />
          </View>
        </LocationProvider>
      </AuthProvider>
    </OnboardingProvider>
  );
}