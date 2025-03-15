import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";
import { useOnboarding } from "../context/OnboardingContext";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import GradientText from "@/components/ui/GradientText";
import BackButton from "@/components/ui/BackButton";
import GradientButton from "@/components/ui/GradientButton";
import LoadingModal from "@/components/ui/LoadingModal";
import Spinner from "@/components/ui/Spinner";

// Interface pour gérer l'état local
interface OTPState {
  code: string;
  isVerifying: boolean;
  error?: string;
}

// Type pour les touches du clavier
type KeypadKey = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

const OTP: React.FC = () => {
  const { endAuthFlow, completeOnboarding } = useOnboarding();
  const router = useRouter();

  const [state, setState] = useState<OTPState>({
    code: "",
    isVerifying: false,
    error: undefined,
  });

  // Gestionnaire pour l'ajout d'un chiffre
  const handleNumberPress = (num: KeypadKey): void => {
    if (state.code.length < 4) {
      setState((prev) => {
        const newCode = prev.code + num;

        // Validation automatique quand le code est complet
        if (newCode.length === 4) {
          handleValidateOTP(newCode);
        }

        return {
          ...prev,
          code: newCode,
          error: undefined,
        };
      });
    }
  };

  // Gestionnaire pour la suppression d'un chiffre
  const handleDelete = (): void => {
    setState((prev) => ({
      ...prev,
      code: prev.code.slice(0, -1),
      error: undefined,
    }));
  };

  // Fonction de validation du code OTP
  const handleValidateOTP = async (codeToValidate: string): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isVerifying: true, error: undefined }));

      // Simuler une vérification API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // TODO: Ajouter la vraie validation API ici
      if (codeToValidate === "0000") {
        throw new Error("Code OTP invalide");
      }

      // Redirection vers ThankForJoint au lieu de terminer le flow
      router.push("/thankforjoint");
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Une erreur est survenue",
        code: "", // Reset du code en cas d'erreur
      }));
    } finally {
      setState((prev) => ({ ...prev, isVerifying: false }));
    }
  };

  // Rendu d'une case OTP
  const renderOtpBox = (index: number): JSX.Element => {
    const isActive = state.code.length === index;
    const isFilled = state.code.length > index;

    return (
      <View
        key={index}
        className={`border-[1px] rounded-3xl w-[65px] h-[65px] flex items-center justify-center
          ${isActive ? "border-orange-500 border-2" : "border-slate-200"}`}
      >
        <Text className="text-3xl font-sofia-medium text-orange-500 ">
          {state.code[index] || ""}
        </Text>
      </View>
    );
  };

  // Rendu d'une touche du clavier
  const renderKeypadButton = (num: KeypadKey): JSX.Element => (
    <TouchableOpacity
      onPress={() => handleNumberPress(num)}
      className="w-[80px] h-[45px] items-center justify-center"
      disabled={state.isVerifying}
    >
      <Text className="text-2xl font-urbanist-medium">{num}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white relative">
      <StatusBar style="dark" />
      <View className="absolute top-0 left-0 right-0">
        <CustomStatusBar />
      </View>

      <View className="flex-1 px-6 pt-6 pb-4">
        <BackButton title="OTP Code Vérification" />

        <View className="flex-1">
          <GradientText fontSize={32} className="mt-10">
            Vérification Code
          </GradientText>
          <Text className="text-base font-sofia-light text-start text-[#595959] mt-6">
            Veuillez saisir le code de vérification envoyé à votre numéro de
            téléphone
          </Text>

          {/* Cases OTP */}
          <View className="flex flex-row items-center justify-between gap-4 mt-10">
            {[0, 1, 2, 3].map(renderOtpBox)}
          </View>

          {/* Message d'erreur */}
          {state.error && (
            <Text className="text-red-500 mt-4 text-center font-urbanist-medium">
              {state.error}
            </Text>
          )}

          {/* Option de renvoi */}
          <View className="items-center justify-center mt-6">
            <Text className="text-base font-sofia-light text-[#424242] mt-6">
              Je ne reçois pas de code !{" "}
              <Text className="text-orange-500">Renvoyer</Text>
            </Text>
          </View>

          {/* Bouton de validation */}
          <GradientButton
            onPress={() => handleValidateOTP(state.code)}
            className="mt-[220px]"
            disabled={state.code.length !== 4 || state.isVerifying}
          >
            Validation
          </GradientButton>
        </View>

        {/* Clavier numérique */}
        <View className="flex-row flex-wrap justify-between bg-[#d1d5db] absolute bottom-0 left-0 right-0 p-2">
          {(["1", "2", "3", "4", "5", "6", "7", "8", "9"] as KeypadKey[]).map(
            (num) => (
              <View
                key={num}
                className="w-[32%] h-14 mb-1 my-1 justify-center items-center bg-white rounded-xl"
                style={{ elevation: 2 }}
              >
                {renderKeypadButton(num)}
              </View>
            ),
          )}
          <View className="w-[32%] rounded-xl">
            <View className="w-[80px] h-[45px]" />
          </View>
          <View
            className="w-[32%] mt-1 bg-white justify-center items-center rounded-xl"
            style={{ elevation: 2 }}
          >
            {renderKeypadButton("0")}
          </View>
          <View className="w-[32%] items-center justify-center">
            <TouchableOpacity
              onPress={handleDelete}
              className="w-[80px] h-[45px] items-center justify-center"
            >
              <Image
                source={require("../../assets/icons/delete.png")}
                className="w-8 h-8"
                style={{ resizeMode: "contain" }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* Loading Modal */}
      <LoadingModal visible={state.isVerifying} />
      {state.isVerifying && (
        <View className="absolute inset-0 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 items-center space-y-4">
            <Spinner size={64} />
            <Text className="font-urbanist-medium text-base text-gray-700">
              Vérification en cours
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default OTP;
