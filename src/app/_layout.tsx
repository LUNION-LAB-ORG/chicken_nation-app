import "../global.css";
import RootNavigator from "./RootNavigator";
import { AuthProvider } from "./context/AuthContext";
import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import OnboardingProvider from "./context/OnboardingContext";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { customFonts } from "../utils/fonts";
import useCartStore from "@/store/cartStore";
import useLocationStore from "@/store/locationStore";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KkiapayProvider } from '@kkiapay-org/react-native-sdk';
import usePaymentStore from '@/store/paymentStore';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';

SplashScreen.preventAutoHideAsync();
 
export default function Layout() {
  const [fontsLoaded] = useFonts(customFonts);
  const [appIsReady, setAppIsReady] = useState(false);
  const { setPaymentSuccess, setPaymentError } = usePaymentStore();
  const router = useRouter();

  // Initialisation du panier au démarrage de l'app
  useEffect(() => {
    useCartStore.getState().initializeCart();
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);

  useEffect(() => {
    // Configurer le deep linking
    const subscription = Linking.addEventListener('url', (event) => {
      const { url } = event;
      console.log('Deep link reçu:', url);
      
      if (url.includes('payment/success')) {
        setPaymentSuccess(true);
        router.push('/(authenticated-only)/checkout');
      } else if (url.includes('payment/cancel')) {
        setPaymentError("Paiement annulé");
        router.push('/(authenticated-only)/checkout');
      }
    });

    // Vérifier si l'app a été ouverte via un deep link
    Linking.getInitialURL().then(url => {
      if (url) {
        console.log('App ouverte via deep link:', url);
        if (url.includes('payment/success')) {
          setPaymentSuccess(true);
          router.push('/(authenticated-only)/checkout');
        } else if (url.includes('payment/cancel')) {
          setPaymentError("Paiement annulé");
          router.push('/(authenticated-only)/checkout');
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (!appIsReady || !fontsLoaded) {
    return null; 
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KkiapayProvider>
        <AuthProvider>
          <OnboardingProvider>
            <View style={StyleSheet.absoluteFill}>
              <RootNavigator />
            </View>
          </OnboardingProvider>
        </AuthProvider>
      </KkiapayProvider>
    </GestureHandlerRootView>
  );
}