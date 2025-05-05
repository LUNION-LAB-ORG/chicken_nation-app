import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Clé pour AsyncStorage
const FIRST_LAUNCH_KEY = "chicken_nation_first_launch";

// Contexte pour le flow d'onboarding
type OnboardingContextType = {
  currentScreen: "splash" | "auth" | "welcome" | null;
  showOnboarding: boolean;
  isAuthFlow: boolean;
  isFirstLaunch: boolean;
  completeAuth: () => void;
  completeOnboarding: () => void;
  startAuthFlow: () => void;
  endAuthFlow: () => void;
};

const OnboardingContext = createContext<OnboardingContextType>({
  currentScreen: null,
  showOnboarding: true,
  isAuthFlow: false,
  isFirstLaunch: true,
  completeAuth: () => {},
  completeOnboarding: () => {},
  startAuthFlow: () => {},
  endAuthFlow: () => {},
});

export const useOnboarding = () => useContext(OnboardingContext);

export const OnboardingProvider = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<
    "splash" | "auth" | "welcome" | null
  >("splash");
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isAuthFlow, setIsAuthFlow] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);

  // Vérifier si c'est le premier lancement
  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const value = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
        setIsFirstLaunch(!value); // true si value est null (premier lancement)
        if (value) {
          setShowOnboarding(false);
          setCurrentScreen(null);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du premier lancement:", error);
      }
    };

    checkFirstLaunch();
  }, []);

  useEffect(() => {
    // Simple temporisateur pour passer automatiquement de l'écran splash à auth
    if (currentScreen === "splash") {
      const timer = setTimeout(() => {
        setCurrentScreen("auth");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const startAuthFlow = () => {
    setIsAuthFlow(true);
  };

  const endAuthFlow = () => {
    setIsAuthFlow(false);
    setShowOnboarding(false);
    setCurrentScreen(null);
  };

  const completeAuth = () => {
    if (!isAuthFlow) {
      setCurrentScreen("welcome");
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(FIRST_LAUNCH_KEY, "true");
      setShowOnboarding(false);
      setCurrentScreen(null);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        currentScreen,
        showOnboarding,
        isAuthFlow,
        isFirstLaunch,
        completeAuth,
        completeOnboarding,
        startAuthFlow,
        endAuthFlow,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export default OnboardingProvider;
