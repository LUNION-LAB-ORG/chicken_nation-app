import React, { useEffect } from "react";
import { Slot, useRouter } from "expo-router";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "./context/AuthContext";
import { useOnboarding } from "./context/OnboardingContext";
import { isProfileComplete } from "@/utils/profile";

export default function RootNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Seulement effectuer la redirection quand le chargement est terminé
    if (!isLoading) { 
      
      if (isAuthenticated && user) { 
        // Vérifier si le profil est complet avant de rediriger vers l'app principale
        if (isProfileComplete(user)) {
          router.replace("/(tabs-user)");
        } else {
          // Rediriger vers la création de compte si le profil est incomplet
          router.replace("/(auth)/create-account");
        }
      } else {
        router.replace("/onboarding/guestAuth");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

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
