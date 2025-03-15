import { View, TouchableOpacity, Text } from "react-native";
import React, { useState } from "react";
import { useOnboarding } from "../context/OnboardingContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import GradientText from "@/components/ui/GradientText";
import NextButton from "@/components/ui/NextButton";
import Animated, { SlideInRight, SlideOutLeft } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";

/**
 * Interface pour les étapes d'onboarding
 */
interface OnboardingStep {
  title: string;
  description: string;
}

/**
 * Écran de bienvenue avec carrousel d'onboarding
 * Affiche une série d'écrans d'introduction à l'application
 */
const WelcomeScreen: React.FC = () => {
  const { completeOnboarding } = useOnboarding();
  const { user } = useAuth();
  const [step, setStep] = useState<number>(1);
  const router = useRouter();

  // Définition des étapes d'onboarding
  const steps: OnboardingStep[] = [
    {
      title: "Parcourez votre menu \n et commandez directement",
      description:
        "Notre application peut vous envoyer\npartout, même dans l'espace.",
    },
    {
      title: "Même dans l'espace avec nous ! \n Ensemble",
      description:
        "Notre application peut vous envoyer \npartout, même dans l'espace.",
    },
    {
      title: "Livraison à emporter \n à votre porte",
      description:
        "Notre application peut vous envoyer \npartout, même dans l'espace.",
    },
  ];

  /**
   * Termine l'onboarding et redirige vers l'écran approprié
   */
  const finishOnboarding = async (): Promise<void> => {
    await completeOnboarding();
    router.push(user ? "/(tabs-user)/" : "/(tabs-guest)/");
  };

  /**
   * Passe à l'étape suivante ou termine l'onboarding
   */
  const handleNext = (): void => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      finishOnboarding();
    }
  };

  /**
   * Ignore l'onboarding et redirige vers l'écran approprié
   */
  const handleSkip = (): void => {
    finishOnboarding();
  };

  /**
   * Rendu du contenu actuel de l'étape d'onboarding
   */
  const renderContent = (): JSX.Element => {
    const currentStep = steps[step - 1];

    return (
      <Animated.View
        entering={SlideInRight.duration(500)}
        exiting={SlideOutLeft.duration(500)}
        key={`step${step}`}
      >
        <GradientText
          colors={["#F17922", "#FA6345"]}
          fontSize={26}
          fontFamily="Urbanist-Bold"
          style={{ textAlign: "center", marginBottom: 20 }}
        >
          {currentStep.title}
        </GradientText>
        <Text className="text-2xl text-center font-urbanist-medium mb-10 text-[#616772]">
          {currentStep.description}
        </Text>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className="flex-1 justify-center items-center relative bg-white p-6">
      <StatusBar style="dark" />

      {/* Cards images verticales */}
      <View className="flex flex-row p-4 gap-3 mb-20">
        <View className="bg-secondary h-[280px] w-[115px] rounded-full"></View>
        <View className="bg-secondary h-[280px] w-[115px] mt-10 rounded-full"></View>
        <View className="bg-secondary h-[280px] w-[115px] mt-16 rounded-full"></View>
      </View>

      {/* Info */}
      <View className="items-center">
        {/* Titre et description avec dégradé */}
        {renderContent()}
        <NextButton onPress={handleNext} />
      </View>

      <TouchableOpacity
        onPress={handleSkip}
        className="absolute bottom-0 mb-10"
        accessibilityLabel="Ignorer l'onboarding"
      >
        <GradientText
          colors={["#F17922", "#FA6345"]}
          fontSize={16}
          fontFamily="Urbanist-Bold-Medium"
          style={{ textAlign: "center" }}
        >
          Ignorer cette étape
        </GradientText>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
