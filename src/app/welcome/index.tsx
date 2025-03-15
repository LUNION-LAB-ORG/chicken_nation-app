import { View, TouchableOpacity, Text } from "react-native";
import React, { useState } from "react";
import { useOnboarding } from "../context/OnboardingContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import GradientText from "@/components/ui/GradientText";
import NextButton from "@/components/ui/NextButton";
import Animated, { SlideInRight, SlideOutLeft } from "react-native-reanimated";
import { useRouter } from "expo-router";

const WelcomeScreen: React.FC = () => {
  const { completeOnboarding } = useOnboarding();
  const [step, setStep] = useState<number>(1);
  const router = useRouter();

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    router.push("/(tabs-guest)/");
  };

  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <Animated.View
            entering={SlideInRight.duration(500)}
            exiting={SlideOutLeft.duration(500)}
            key="step1"
          >
            <GradientText
              colors={["#F17922", "#FA6345"]}
              fontSize={26}
              fontFamily="Urbanist-Bold"
              style={{ textAlign: "center", marginBottom: 20 }}
            >
              Parcourez votre menu {`\n`} et commandez directement
            </GradientText>
            <Text className="text-2xl text-center font-urbanist-medium mb-10 text-[#616772]">
              Notre application peut vous envoyer{`\n`}partout, même dans
              l'espace.
            </Text>
          </Animated.View>
        );
      case 2:
        return (
          <Animated.View
            entering={SlideInRight.duration(500)}
            exiting={SlideOutLeft.duration(500)}
            key="step2"
          >
            <GradientText
              colors={["#F17922", "#FA6345"]}
              fontSize={26}
              fontFamily="Urbanist-Bold"
              style={{ textAlign: "center", marginBottom: 20 }}
            >
              Même dans l'espace avec nous ! {`\n`} Ensemble
            </GradientText>
            <Text className="text-2xl text-center font-urbanist-medium mb-10 text-[#616772]">
              Notre application peut vous envoyer {`\n`}partout, même dans
              l'espace.
            </Text>
          </Animated.View>
        );
      case 3:
        return (
          <Animated.View
            entering={SlideInRight.duration(500)}
            exiting={SlideOutLeft.duration(500)}
            key="step3"
          >
            <GradientText
              colors={["#F17922", "#FA6345"]}
              fontSize={26}
              fontFamily="Urbanist-Bold"
              style={{ textAlign: "center", marginBottom: 20 }}
            >
              Livraison à emporter {`\n`} à votre porte
            </GradientText>
            <Text className="text-2xl text-center font-urbanist-medium mb-10 text-[#616772]">
              Notre application peut vous envoyer {`\n`}partout, même dans
              l'espace.
            </Text>
          </Animated.View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-center items-center relative bg-white p-6">
      <StatusBar style="dark" />

      {/* Cards images verticales */}
      <View className="flex flex-row p-4 gap-3 mb-20">
        <View className="  bg-secondary h-[280px] w-[115px] rounded-full"></View>
        <View className="  bg-secondary h-[280px] w-[115px] mt-10 rounded-full"></View>
        <View className="  bg-secondary h-[280px] w-[115px] mt-16 rounded-full"></View>
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
