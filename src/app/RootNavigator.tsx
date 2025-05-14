import React, { useEffect } from "react";
import { Slot, usePathname, useRouter } from "expo-router";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "./context/AuthContext";
import { isProfileComplete } from "@/utils/profile";
import { useOnboarding } from "./context/OnboardingContext";

export default function RootNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthFlow, showOnboarding } = useOnboarding();

  useEffect(() => {
    // Désactiver temporairement les redirections pour débloquer l'utilisateur
    return;

    /* Code original commenté
    if (isLoading) return; 

    // Les chemins autorisés sans authentification
    const ALLOWED_UNAUTHENTICATED_PATHS = [
      "/onboarding/guestAuth",
      "/onboarding/welcome",
      "/onboarding/splash",
      "/(auth)/authwithphone",
      "/(tabs-guest)",
      "/(tabs-guest)/",
    ];

    if (isAuthenticated && user) {
      // Si l'utilisateur est sur la page d'accueil ou guestAuth, le rediriger vers l'interface utilisateur
      if (pathname === "/" || pathname === "/onboarding/guestAuth") {
        router.replace("/(tabs-user)/");
        return;
      }
      
      if (isProfileComplete(user)) {
        if (pathname === "/(auth)/create-account") {
          router.replace("/(tabs-user)"); // Rediriger vers la partie authentifiée si le profil est complet
        }
      } else {
        const ALLOWED_PATHS = [
          "/(authenticated-only)/settings/account", 
          "/(auth)/create-account"
        ];
        const isAllowed = ALLOWED_PATHS.some(path => pathname.startsWith(path));
  
        if (!isAllowed) {
          router.replace("/(auth)/create-account"); // Rediriger vers l'étape de création de compte si le profil n'est pas complet
        }
      }
    } else {
      // Pour les utilisateurs non authentifiés, vérifier si le chemin actuel est autorisé
      const isPathAllowed = ALLOWED_UNAUTHENTICATED_PATHS.some(path => 
        pathname === path || pathname.startsWith(path)
      );
      
      // Ne rediriger que si le chemin n'est pas autorisé et que nous ne sommes pas dans le flux d'authentification
      // et que nous ne sommes pas en train de naviguer vers ou depuis les écrans d'onboarding
      const isNavigatingFromOnboarding = pathname === "/onboarding/welcome" || pathname.startsWith("/(tabs-guest)");
      
      if (!isPathAllowed && !isAuthFlow && !showOnboarding && !isNavigatingFromOnboarding) {
        console.log("[RootNavigator] Redirection vers guestAuth depuis", pathname);
        router.replace("/onboarding/guestAuth");
      }
    }
    */
  }, [isLoading, isAuthenticated, user, pathname, isAuthFlow, showOnboarding]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <Slot />
      {isLoading && (
        <View style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'white',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}>
          <ActivityIndicator size="large" color="#F17922" />
        </View>
      )}
    </View>
  );
}
