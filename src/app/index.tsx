import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useOnboarding } from "./context/OnboardingContext";
import { useAuth } from "./context/AuthContext";
import Splash from "./onboarding/splash";
import GuestAuth from "./onboarding/guestAuth";
import WelcomeScreen from "./onboarding/welcome"; 

export default function Index() {
  const router = useRouter();
  const { currentScreen, showOnboarding, isAuthFlow, isFirstLaunch } = useOnboarding();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Effet principal pour la navigation
  useEffect(() => {
    console.log("[Index] isLoading:", isLoading, ", isAuthenticated:", isAuthenticated, ", showOnboarding:", showOnboarding, ", isFirstLaunch:", isFirstLaunch);
    
    // Ne pas rediriger pendant le chargement
    if (isLoading) {
      console.log("[Index] Chargement en cours, attente...");
      return;
    }
    
    // Priorité 1: Si c'est le premier lancement et qu'on doit montrer l'onboarding
    if (isFirstLaunch && showOnboarding && currentScreen) {
      
      // Laisser l'onboarding s'afficher sans redirection
      return;
    }
    
    // Priorité 2: Si l'utilisateur est authentifié, aller aux tabs utilisateur
    if (isAuthenticated && user) {
      
      router.replace("/(tabs-user)/");
      return;
    }
    
    // Priorité 3: Si l'utilisateur n'est pas authentifié et qu'on n'est pas dans le flow d'auth
    if (!isAuthenticated && !isAuthFlow && !isLoading) {
     
      router.replace("/onboarding/guestAuth");
      return;
    }
  }, [isAuthenticated, isLoading, showOnboarding, currentScreen, isFirstLaunch, isAuthFlow, user, router]);

  // Afficher l'écran d'onboarding approprié si nécessaire
  if (showOnboarding && !isAuthFlow && currentScreen) {
    return (
      <View style={StyleSheet.absoluteFill}>
        {currentScreen === "splash" && <Splash />}
        {currentScreen === "auth" && <GuestAuth />}
        {currentScreen === "welcome" && <WelcomeScreen />}
      </View>
    );
  }

  // Afficher un écran de chargement en attendant la redirection
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#F17922" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});