import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useOnboarding } from "./context/OnboardingContext";
import { useAuth } from "./context/AuthContext";
import Splash from "./onboarding/splash";
import GuestAuth from "./onboarding/guestAuth";
import WelcomeScreen from "./onboarding/welcome";
import Spinner from "@/components/ui/Spinner";

export default function Index() {
  const router = useRouter();
  const { currentScreen, showOnboarding, isAuthFlow } = useOnboarding();
  const { user } = useAuth();

  // Effet pour gérer les redirections
  useEffect(() => {
    // Ne rien faire si on est en train de gérer l'authentification
    if (isAuthFlow) {
      return;
    }

    // Ne rien faire si on doit montrer l'onboarding
    if (showOnboarding) {
      return;
    }

    // Attendre que l'état d'authentification soit initialisé
    if (user === undefined) {
      return;
    }

    // Rediriger vers les tabs appropriés
    router.replace(user ? "/(tabs-user)/" : "/(tabs-guest)/");
  }, [showOnboarding, user, isAuthFlow, router]);

  // Afficher l'écran d'onboarding approprié si nécessaire
  if (showOnboarding && !isAuthFlow) {
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
      <Spinner />
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
