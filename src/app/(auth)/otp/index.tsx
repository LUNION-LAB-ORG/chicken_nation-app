import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { useOnboarding } from "../../context/OnboardingContext";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import GradientText from "@/components/ui/GradientText";
import BackButton from "@/components/ui/BackButton";
import GradientButton from "@/components/ui/GradientButton";
import LoadingModal from "@/components/ui/LoadingModal";
import Spinner from "@/components/ui/Spinner";
import ErrorModal from "@/components/ui/ErrorModal";
import SuccessModal from "@/components/ui/SuccessModal";
import { verifyOTP, requestOTP } from "@/services/api/auth"; 
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/app/context/AuthContext";
import { setAuthToken } from "@/services/api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isProfileComplete } from "@/utils/profile";

// Interface pour gérer l'état local
interface OTPState {
  code: string;
  isVerifying: boolean;
  error?: string;
  resendTimer: number;
  isResending: boolean;
}

// Type pour les touches du clavier
type KeypadKey = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

const OTP: React.FC = () => {
  const { phone } = useLocalSearchParams<{ 
    phone: string; 
  }>();
  const { completeOnboarding } = useOnboarding();
  const { login } = useAuth();
  const router = useRouter();
 
  const [state, setState] = useState<OTPState>({
    code: "",
    isVerifying: false,
    error: undefined,
    resendTimer: 30,
    isResending: false,
  });

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Gestion du timer pour le renvoi du code
  useEffect(() => {
    if (state.resendTimer > 0) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, resendTimer: prev.resendTimer - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.resendTimer]);
 
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

  // Fonction pour renvoyer le code OTP
  const handleResendOTP = async (): Promise<void> => {
    if (state.resendTimer > 0 || state.isResending) return;
    
    try {
      setState(prev => ({ ...prev, isResending: true, error: undefined }));
      
      if (!phone) throw new Error("Numéro de téléphone manquant");
      
      await requestOTP(phone as string);
      
      setState(prev => ({
        ...prev,
        resendTimer: 30,
        isResending: false,
      }));
      
      setSuccessMessage("Un nouveau code OTP a été envoyé à votre numéro");
      setShowSuccessModal(true);
    } catch (error) {
      setState(prev => ({
        ...prev,
        isResending: false,
        error: error instanceof Error ? error.message : "Erreur lors de l'envoi du code",
      }));
    }
  };

  // Fonction de validation du code OTP
  const handleValidateOTP = async (codeToValidate: string): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isVerifying: true, error: undefined }));
      
      if (!phone) throw new Error("Numéro de téléphone manquant");

      const localPhone = (typeof phone === 'string') ? phone.replace(/\D/g, '').replace(/^225/, '') : '';

      const payload = {
        otp: codeToValidate,
        phone: localPhone,
      };

      // Appel à l'API pour vérifier le code OTP
      const response = await verifyOTP(payload);
      
      // Vérifier que nous avons bien reçu le token
      if (!response.token) {
        throw new Error("Token d'authentification manquant dans la réponse");
      }
      
      // Utiliser le nouveau contexte d'authentification pour stocker les informations utilisateur
      await login(
        {
          id: response.id,
          first_name: response.first_name,
          last_name: response.last_name,
          birth_day: response.birth_day,
          email: response.email,
          image: response.image,
          created_at: response.created_at,
          updated_at: response.updated_at,
          phone: localPhone
        },
        response.token
      );
      
      // Vérifier si l'utilisateur existe déjà ou s'il faut compléter son profil
      const userData = {
        id: response.id,
        first_name: response.first_name,
        last_name: response.last_name,
        birth_day: response.birth_day,
        email: response.email,
        image: response.image,
        created_at: response.created_at,
        updated_at: response.updated_at,
        phone: localPhone
      };

      const profileComplete = isProfileComplete(userData);
      console.log('[OTP] Profile complete:', profileComplete, userData);

      if (profileComplete) {
        // Compte complet, accès direct à l'app
        router.replace("/(tabs-user)/");
      } else {
        // Compte incomplet (nouvel inscrit ou profil à compléter)
        router.replace("/(auth)/create-account/");
      }
    } catch (error: any) {
      const message = error instanceof Error ? error.message : "Code OTP invalide";
      setState((prev) => ({
        ...prev,
        error: message,
        code: "",
      }));
      setErrorMessage(message);
      setShowErrorModal(true);
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
            téléphone {phone && `(${phone})`}
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
              {state.resendTimer > 0 ? (
                <Text className="text-orange-500">({state.resendTimer}s)</Text>
              ) : (
                <TouchableOpacity onPress={handleResendOTP} disabled={state.isResending}>
                  <Text className="text-orange-500">
                    {state.isResending ? "Envoi en cours..." : "Renvoyer"}
                  </Text>
                </TouchableOpacity>
              )}
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
                source={require("../../../assets/icons/delete.png")}
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
              Vérification en cours...
            </Text>
          </View>
        </View>
      )}
      <ErrorModal
        visible={showErrorModal}
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />
      <SuccessModal
        visible={showSuccessModal}
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
      />
    </View>
  );
};

export default OTP;
