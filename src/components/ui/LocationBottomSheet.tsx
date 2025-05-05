import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity, 
  Dimensions,
  Platform,
  Image,
} from "react-native";
import { router, useRouter } from "expo-router";
import { MapPin, Plus } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useAnimatedGestureHandler,
  runOnJS,
} from "react-native-reanimated";
import { PanGestureHandler } from "react-native-gesture-handler";
import { useAuth } from "@/app/context/AuthContext";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface LocationBottomSheetProps {
  onUseCurrentLocation: () => void;
  onAddAddressManually: () => void;
}

const LocationBottomSheet: React.FC<LocationBottomSheetProps> = ({
  onUseCurrentLocation,
  onAddAddressManually,
}) => {
  const { isAuthenticated } = useAuth();

  const SHEET_HEIGHT = SCREEN_HEIGHT * 0.19; 
  const MINIMIZED_POSITION = SCREEN_HEIGHT - 100; 
  const EXPANDED_POSITION = SCREEN_HEIGHT - SHEET_HEIGHT; 

  const translateY = useSharedValue(MINIMIZED_POSITION);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    translateY.value = withTiming(MINIMIZED_POSITION, {
      duration: 300,
    });
  }, []);

  // Fonction pour basculer l'état du sheet
  const toggleSheet = () => {
    const newPosition = isExpanded ? MINIMIZED_POSITION : EXPANDED_POSITION;
    translateY.value = withTiming(newPosition, {
      duration: 300,
    });
    setIsExpanded(!isExpanded);
  };

  // Gestionnaire de gestes pour le glissement
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      // Calculer la nouvelle position en fonction du geste
      let newPosition = ctx.startY + event.translationY;
      
      // Limiter la position entre EXPANDED_POSITION et MINIMIZED_POSITION
      newPosition = Math.max(EXPANDED_POSITION, newPosition);
      newPosition = Math.min(MINIMIZED_POSITION, newPosition);
      
      translateY.value = newPosition;
    },
    onEnd: (event) => {
      // Déterminer si l'utilisateur a glissé suffisamment pour changer d'état
      const shouldExpand = event.velocityY < -500 || 
                          (translateY.value < (MINIMIZED_POSITION + EXPANDED_POSITION) / 2);
      
      const newPosition = shouldExpand ? EXPANDED_POSITION : MINIMIZED_POSITION;
      translateY.value = withTiming(newPosition, { duration: 300 });
      
      // Mettre à jour l'état d'expansion
      runOnJS(setIsExpanded)(shouldExpand);
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  
  const handleRedirectToLogin = () => {
    router.push("/(tabs-guest)/login");
    toggleSheet();
  };

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
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
          {/* Poignée */}
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
    </PanGestureHandler>
  );
};

export default LocationBottomSheet;
