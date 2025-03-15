import { View, Text, Image, Platform, StyleSheet } from "react-native";
import React, { useState, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import GradientText from "@/components/ui/GradientText";
import GradientButton from "@/components/ui/GradientButton";
import { useRouter } from "expo-router";
import { useOnboarding } from "../../context/OnboardingContext";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";

/**
 * Types pour la gestion des étapes d'autorisation
 */
type AuthStep = 1 | 2;

/**
 * Types pour les états de permissions
 */
type PermissionStatus = "pending" | "granted" | "denied";

/**
 * Interface pour la gestion de l'état des permissions
 */
interface PermissionState {
  notifications: PermissionStatus;
  location: PermissionStatus;
  currentStep: AuthStep;
}

/**
 * Écran de demande d'autorisations
 * Gère les demandes d'autorisations pour les notifications et la localisation
 */
const Autorisations: React.FC = () => {
  const router = useRouter();
  const { endAuthFlow, completeOnboarding } = useOnboarding();

  // Gestion centralisée de l'état des permissions
  const [state, setState] = useState<PermissionState>({
    notifications: "pending",
    location: "pending",
    currentStep: 1,
  });

  /**
   * Demande les permissions pour les notifications
   */
  const handleNotificationPermission = useCallback(async (): Promise<void> => {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      if (existingStatus === "granted") {
        setState((prev) => ({
          ...prev,
          notifications: "granted",
          currentStep: 2,
        }));
        return;
      }

      const { status } = await Notifications.requestPermissionsAsync();

      if (status === "granted") {
        setState((prev) => ({
          ...prev,
          notifications: "granted",
          currentStep: 2,
        }));
      } else {
        setState((prev) => ({ ...prev, notifications: "denied" }));
      }
    } catch (error) {
      console.error("[Autorisations] Notification permission error:", error);
      setState((prev) => ({ ...prev, notifications: "denied" }));
    }
  }, []);

  /**
   * Demande les permissions pour la localisation
   */
  const handleLocationPermission = useCallback(async (): Promise<void> => {
    try {
      const { status: existingStatus } =
        await Location.getForegroundPermissionsAsync();

      if (existingStatus === "granted") {
        setState((prev) => ({ ...prev, location: "granted" }));
        handleFinish();
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        setState((prev) => ({ ...prev, location: "granted" }));
        handleFinish();
      } else {
        setState((prev) => ({ ...prev, location: "denied" }));
      }
    } catch (error) {
      console.error("[Autorisations] Location permission error:", error);
      setState((prev) => ({ ...prev, location: "denied" }));
    }
  }, []);

  /**
   * Termine le processus d'onboarding et redirige vers l'application utilisateur
   */
  const handleFinish = useCallback((): void => {
    // D'abord terminer le flow d'auth et l'onboarding
    endAuthFlow();
    completeOnboarding();

    // Ensuite faire la navigation avec un petit délai pour laisser le temps au contexte de se mettre à jour
    setTimeout(() => {
      router.replace("/(tabs-user)/");
    }, 100);
  }, [endAuthFlow, completeOnboarding, router]);

  // Rendu des étapes
  const renderStep = (step: AuthStep): JSX.Element => {
    const isNotificationStep = step === 1;

    return (
      <Animated.View
        className="flex-1 justify-between"
        entering={isNotificationStep ? FadeIn : SlideInRight}
        exiting={isNotificationStep ? SlideOutLeft : FadeOut}
      >
        <View className="flex-1">
          <GradientText
            className="text-center font-urbanist-bold mt-20"
            fontSize={32}
          >
            {isNotificationStep ? "Notifications" : "Localisation"}
          </GradientText>

          <View className="flex-1 items-center justify-center -mt-80">
            <Image
              source={
                isNotificationStep
                  ? require("../../../assets/icons/notifications.png")
                  : require("../../../assets/icons/location.png")
              }
              className="w-64 h-64"
              resizeMode="contain"
            />

            <Text className="text-center text-[14px] font-urbanist-medium text-gray-500 mt-4 px-6">
              {isNotificationStep
                ? "Pour retracer votre commande et vous offrir la meilleure expérience, permettez-nous de vous adresser des notifications push."
                : "Afin d'accélérer votre commande, permettez-nous de vous géolocaliser pendant que vous utilisez votre application"}
            </Text>
          </View>
        </View>

        <GradientButton
          onPress={
            isNotificationStep
              ? handleNotificationPermission
              : handleLocationPermission
          }
          className="w-full mt-12"
          disabled={
            isNotificationStep
              ? state.notifications === "denied"
              : state.location === "denied"
          }
        >
          Autoriser
        </GradientButton>
      </Animated.View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <CustomStatusBar />
      <View className="flex-1 p-6">{renderStep(state.currentStep)}</View>
    </View>
  );
};

export default Autorisations;
