import {
  View,
  Text,
  Dimensions,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useAuth } from "@/app/context/AuthContext";
import { router } from "expo-router";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * Props du composant LocationBottomSheet
 */
interface LocationBottomSheetProps {
  /** Fonction appelée lorsque l'utilisateur choisit d'utiliser sa position actuelle */
  onUseCurrentLocation: () => void;
  /** Fonction appelée lorsque l'utilisateur choisit d'ajouter une adresse manuellement */
  onAddAddressManually: () => void;
}

/**
 * Bottom sheet pour les options de localisation
 * Permet de choisir entre utiliser la localisation actuelle ou ajouter une adresse manuellement
 * Si l'utilisateur n'est pas connecté, affiche un message l'invitant à se connecter
 */
const LocationBottomSheet: React.FC<LocationBottomSheetProps> = ({
  onUseCurrentLocation,
  onAddAddressManually,
}) => {
  // Récupération de l'état d'authentification
  const { isAuthenticated } = useAuth();
  
  // Configuration des positions du sheet
  const SHEET_HEIGHT = SCREEN_HEIGHT * 0.19; // Hauteur du sheet
  const MINIMIZED_POSITION = SCREEN_HEIGHT - 100; // Position minimisée  
  const EXPANDED_POSITION = SCREEN_HEIGHT - SHEET_HEIGHT; // Position développée

  // État pour l'animation et l'expansion
  const translateY = useSharedValue(MINIMIZED_POSITION);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Initialisation de la position
  useEffect(() => {
    translateY.value = withTiming(MINIMIZED_POSITION, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, []);

  const toggleSheet = (): void => {
    const newPosition = isExpanded ? MINIMIZED_POSITION : EXPANDED_POSITION;

    translateY.value = withTiming(newPosition, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    setIsExpanded(!isExpanded);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  
  // Redirection vers la page de connexion
  const handleRedirectToLogin = () => {
    router.push("/(tabs-guest)/login");
    toggleSheet();
  };

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: SHEET_HEIGHT + 100,
          backgroundColor: "white",
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -5,
          },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          paddingBottom: Platform.OS === "ios" ? 20 : 0,
        },
        animatedStyle,
      ]}
    >
      {/* Poignée pour tirer le sheet vers le haut/bas */}
      <TouchableOpacity
        onPress={toggleSheet}
        style={{
          width: "100%",
          alignItems: "center",
          paddingVertical: 15,
          height: 50,
        }}
        accessibilityLabel="Afficher les options de localisation"
      >
        <View
          style={{
            width: 60,
            height: 5,
            backgroundColor: "#DDD",
            borderRadius: 5,
          }}
        />
      </TouchableOpacity>

      {/* Contenu du sheet */}
      <View
        style={{
          paddingHorizontal: 20,
          height: SHEET_HEIGHT - 40,
        }}
      >
        {isAuthenticated ? (
          // Contenu pour utilisateur authentifié
          <>
            {/* Option: Utiliser la localisation actuelle */}
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 8,
              }}
              onPress={() => {
                onUseCurrentLocation();
                toggleSheet();
              }}
              accessibilityLabel="Utiliser la localisation actuelle"
            >
              <Image
                source={require("../../assets/icons/map-arrow.png")}
                style={{ width: 24, height: 24, resizeMode: "contain" }}
                accessibilityLabel="Icône de localisation"
              />
              <Text
                className="font-sofia-medium"
                style={{ fontSize: 16, marginLeft: 15 }}
              >
                Utiliser la localisation actuelle
              </Text>
            </TouchableOpacity>

            {/* Séparateur */}
            <View style={{ paddingVertical: 5 }}>
              <View
                style={{
                  borderBottomWidth: 0.5,
                  borderColor: "#CCC",
                  width: "100%",
                }}
              />
            </View>

            {/* Option: Ajouter une adresse manuellement */}
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 15,
              }}
              onPress={() => {
                onAddAddressManually();
                toggleSheet();
              }}
              accessibilityLabel="Ajouter une adresse manuellement"
            >
              <Image
                source={require("../../assets/icons/plus.png")}
                style={{
                  width: 26,
                  height: 26,
                  resizeMode: "contain",
                  marginBottom: -5,
                  marginLeft: -3,
                }}
                accessibilityLabel="Icône plus"
              />
              <Text
                className="text-slate-900 font-sofia-medium"
                style={{ fontSize: 16, marginLeft: 8 }}
              >
               Nouvelle adresse
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          // Message pour utilisateur non authentifié
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text
              className="text-center font-sofia-medium text-gray-800"
              style={{ fontSize: 16, marginBottom: 12 }}
            >
              Connecte-toi pour enregistrer tes adresses
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#F17922',
                paddingVertical: 8,
                paddingHorizontal: 20,
                borderRadius: 8,
              }}
              onPress={handleRedirectToLogin}
            >
              <Text className="text-white font-sofia-medium">
                Se connecter
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

export default LocationBottomSheet;
