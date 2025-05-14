import { View, Text, TextInput, TouchableOpacity, Image, Platform } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useOnboarding } from "../../context/OnboardingContext";
import { useRouter } from "expo-router";
import GradientText from "@/components/ui/GradientText";
import GradientButton from "@/components/ui/GradientButton";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import { loginCustomer } from "@/services/api/auth";

/**
 * Interface pour l'état du formulaire d'authentification
 */
interface AuthState {
  phone: string;
  isFocused: boolean;
  isLoading: boolean;
  error?: string;
}

/**
 * Écran d'authentification par téléphone
 * Permet à l'utilisateur de se connecter ou s'inscrire avec un numéro de téléphone
 */
const AuthWithPhone: React.FC = () => {
  const { endAuthFlow, completeOnboarding } = useOnboarding();
  const router = useRouter();

  // État pour gérer le formulaire d'authentification
  const [state, setState] = useState<AuthState>({
    phone: "",
    isFocused: false,
    isLoading: false,
    error: undefined,
  });

  /**
   * Formatage du numéro de téléphone
   * @param phone Numéro de téléphone à formatter
   * @returns Numéro de téléphone formaté
   */
  const formatPhoneNumber = (phone: string): string => {
    // Enlever tous les caractères non numériques
    const cleaned = phone.replace(/\D/g, '');
    
    // S'assurer que le numéro commence par +225
    if (cleaned.startsWith('0')) {
      return '+225' + cleaned.substring(1);
    } else if (!cleaned.startsWith('225')) {
      return '+225' + cleaned;
    }
    return '+' + cleaned;
  };

  /**
   * Gère les changements de valeur de l'input téléphone
   */
  const handleInputChange = (text: string): void => {
    setState((prev) => ({
      ...prev,
      phone: text,
      error: undefined,
    }));
  };

  /**
   * Gère la soumission du formulaire de connexion
   * Valide le téléphone et redirige vers l'écran de code OTP
   */
  const handleLogin = async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: undefined }));
      
      // Valider le format du numéro de téléphone (8 chiffres pour la Côte d'Ivoire)
      const phoneRegex = /^[0-9+\s()-]{8,}$/;
      if (!phoneRegex.test(state.phone)) {
        throw new Error("Format téléphone invalide");
      }

      // Formater le numéro de téléphone au format local (ex: 0101010101)
      const localPhone = state.phone.replace(/\D/g, '').replace(/^225/, '');
      console.log('Sending login request for phone:', localPhone);

      // Demander un code OTP et vérifier si l'utilisateur existe
      const response = await loginCustomer(localPhone);
      console.log('Login response:', response);
      
      // Afficher l'OTP dans la console (pour le développement)
      if (response.otp) {
        console.log('OTP Code (Dev Only):', response.otp);
      } else {
        console.warn('No OTP received from API');
      }
      
      // Rediriger vers la page OTP en passant le numéro local
      router.push({
        pathname: "/(auth)/otp",
        params: { 
          phone: localPhone,
          userExists: response.exists ? "true" : "false"
        }
      });
    } catch (error) {
      console.error('Error in handleLogin:', error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Erreur inconnue",
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
        style={{ padding: Platform.OS === "ios" ? 22 : 16,borderWidth:1, 
          borderColor: Platform.OS === "ios" ? "#e2e8f0" : "#fff" }}
          className={`p-4 mt-16 mb-12 w-full rounded-3xl bg-slate-100 ${
            state.isFocused ? "border-2 border-orange-500" : ""
          }`}
        >
          <TextInput
            placeholder="Numéro de téléphone (ex: 0707070707)"
            onFocus={() => setState((prev) => ({ ...prev, isFocused: true }))}
            onBlur={() => setState((prev) => ({ ...prev, isFocused: false }))}
            onChangeText={handleInputChange}
            value={state.phone}
            className="font-urbanist-medium"
          placeholderTextColor={"#9CA3AF"}
            keyboardType="phone-pad"
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
          
          disabled={state.isLoading || !state.phone.trim()}
        >
          {state.isLoading ? "Chargement..." : "Connexion"}
        </GradientButton>
      </View>
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

export default AuthWithPhone;
