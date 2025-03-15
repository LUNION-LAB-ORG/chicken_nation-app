import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useOnboarding } from "../../context/OnboardingContext";
import { useRouter } from "expo-router";
import GradientText from "@/components/ui/GradientText";
import GradientButton from "@/components/ui/GradientButton";
import CustomStatusBar from "@/components/ui/CustomStatusBar";

/**
 * Interface pour l'état du formulaire d'authentification
 */
interface AuthState {
  email: string;
  isFocused: boolean;
  isLoading: boolean;
  error?: string;
}

/**
 * Écran d'authentification par email ou téléphone
 * Permet à l'utilisateur de se connecter ou s'inscrire avec un email ou numéro de téléphone
 */
const AuthWithEmail: React.FC = () => {
  const { endAuthFlow, completeOnboarding } = useOnboarding();
  const router = useRouter();

  // État pour gérer le formulaire d'authentification
  const [state, setState] = useState<AuthState>({
    email: "",
    isFocused: false,
    isLoading: false,
    error: undefined,
  });

  /**
   * Gère les changements de valeur de l'input email/téléphone
 
   */
  const handleInputChange = (text: string): void => {
    setState((prev) => ({
      ...prev,
      email: text,
      error: undefined,
    }));
  };

  /**
   * Gère la soumission du formulaire de connexion
   * Valide l'email ou le téléphone et redirige vers l'écran de code OTP
   */
  const handleLogin = async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: undefined }));

      // Validation basique de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[\d\s+()-]{10,}$/;

      if (!emailRegex.test(state.email) && !phoneRegex.test(state.email)) {
        throw new Error("Format email ou téléphone invalide");
      }

      router.push("/otp");
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Une erreur est survenue",
      }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  /**
   * Ignore l'étape d'authentification et rediriger vers l'application guest
   */
  const handleSkip = (): void => {
    router.push("/(tabs-guest)/");
  };

  return (
    <View className="flex-1 bg-white p-6 relative">
      <StatusBar style="dark" />
      <View className="absolute top-0 left-0 right-0">
        <CustomStatusBar />
      </View>
      <View className="flex-1 justify-center items-center">
        <Image
          source={require("../../../assets/icons/logo.png")}
          style={{ width: 140, height: 140, resizeMode: "contain" }}
          accessibilityLabel="Logo"
        />
        <GradientText className="mt-10">Connexion ou inscription</GradientText>
        <View
          className={`p-4 mt-16 w-full rounded-3xl bg-slate-50 ${
            state.isFocused ? "border-2 border-orange-500" : ""
          }`}
        >
          <TextInput
            placeholder="Email ou numéro de téléphone"
            onFocus={() => setState((prev) => ({ ...prev, isFocused: true }))}
            onBlur={() => setState((prev) => ({ ...prev, isFocused: false }))}
            onChangeText={handleInputChange}
            value={state.email}
            className="font-urbanist-medium"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {state.error && (
          <Text className="text-red-500 mt-2 font-urbanist-medium">
            {state.error}
          </Text>
        )}

        <GradientButton
          onPress={handleLogin}
          className="w-full mt-6"
          disabled={state.isLoading}
        >
          {state.isLoading ? "Chargement..." : "Connexion"}
        </GradientButton>

        <View className="p-5 mt-10 w-full rounded-3xl bg-slate-50">
          <Text className="font-urbanist-medium text-center">
            Ou continue avec
          </Text>
        </View>
      </View>

      <TouchableOpacity className="p-5   w-full rounded-3xl flex-row items-center justify-center bg-slate-50">
        <Image
          source={require("../../../assets/icons/google.png")}
          style={{ width: 29, height: 29, resizeMode: "contain" }}
        />
        <Text className=" ml-2 font-urbanist-medium text-center">Google</Text>
      </TouchableOpacity>

      <TouchableOpacity className="p-5 mt-4 w-full rounded-3xl flex-row items-center justify-center bg-slate-50">
        <Image
          source={require("../../../assets/icons/facebook.png")}
          style={{ width: 29, height: 29, resizeMode: "contain" }}
        />
        <Text className=" ml-2 font-urbanist-medium text-center">Facebook</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSkip}
        className="items-center justify-center"
        disabled={state.isLoading}
      >
        <GradientText
          fontSize={14}
          fontFamily="Urbanist-Medium"
          className="mb-4 mt-10"
        >
          Ignorer cette étape
        </GradientText>
      </TouchableOpacity>
    </View>
  );
};

export default AuthWithEmail;
