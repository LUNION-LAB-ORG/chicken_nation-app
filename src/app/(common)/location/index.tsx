import React, { useRef, useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Alert,
  Text,
  StyleSheet,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker, Region } from "react-native-maps";
import * as ExpoLocation from "expo-location";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import LocationBottomSheet from "@/components/ui/LocationBottomSheet";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import BackButtonTwo from "@/components/ui/BackButtonTwo";
import { useLocation } from "../../context/LocationContext";
import { useRouter, useLocalSearchParams } from "expo-router";
import Spinner from "@/components/ui/Spinner"; 
import { addUserAddress, Address } from "@/services/api/address";
import { useAuth } from "@/app/context/AuthContext";

// Structure des coordonnées géographiques
interface Coordinates {
  latitude: number;
  longitude: number;
}

// Région par défaut centrée sur Abidjan
const ABIDJAN_REGION: Region = {
  latitude: 5.3599517,
  longitude: -4.0082563,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const Location: React.FC = () => {
  const mapRef = useRef<MapView | null>(null);
  const {
    locationData,
    setCoordinates,
    setLocationType,
    reverseGeocode,
    setAddressDetails,
  } = useLocation();
  const params = useLocalSearchParams();
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(
    locationData.coordinates,
  );
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [showTitleModal, setShowTitleModal] = useState<boolean>(false);
  const [addressTitle, setAddressTitle] = useState<string>("");
  const [tempLocationData, setTempLocationData] = useState<any>(null);
  const [isMovingMarker, setIsMovingMarker] = useState<boolean>(false);
  const router = useRouter();

  // Mise à jour de la carte quand les coordonnées changent dans le contexte
  useEffect(() => {
    if (locationData.coordinates) {
      setCurrentLocation(locationData.coordinates);
      centerOnLocation(
        locationData.coordinates.latitude,
        locationData.coordinates.longitude
      );
    }
  }, [locationData.coordinates]);

  // Gestion des coordonnées reçues via les paramètres de navigation
  useEffect(() => {
    if (params.lat && params.lon) {
      const newLocation = {
        latitude: parseFloat(params.lat as string),
        longitude: parseFloat(params.lon as string)
      };
      
      setCurrentLocation(newLocation);
      centerOnLocation(newLocation.latitude, newLocation.longitude);
      
      setCoordinates(newLocation);
      setAddressDetails({
        formattedAddress: params.address as string,
        title: "Adresse sélectionnée"
      });
      setLocationType("manual");
    }
  }, [params.lat, params.lon]);

  // Obtention de la position actuelle de l'utilisateur avec gestion des permissions
  const getCurrentLocation = async (): Promise<void> => {
    try {
      setIsLocating(true);
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission refusée",
          "Veuillez autoriser l'accès à la localisation pour utiliser cette fonctionnalité.",
          [{ text: "OK" }],
        );
        return;
      }

      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Highest,
      });
      const coordinates: Coordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCurrentLocation(coordinates);
      centerOnLocation(coordinates.latitude, coordinates.longitude);
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert(
        "Erreur de localisation",
        "Impossible d'obtenir votre position actuelle. Veuillez réessayer.",
        [{ text: "OK" }],
      );
    } finally {
      setIsLocating(false);
    }
  };

  // Animation de la carte vers une position donnée
  const centerOnLocation = (latitude: number, longitude: number): void => {
    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      1000,
    );
  };

  // Mise à jour de la position après le déplacement du marqueur
  const handleMarkerDragEnd = (event: {
    nativeEvent: { coordinate: Coordinates };
  }): void => {
    setCurrentLocation(event.nativeEvent.coordinate);
  };

  // Activer/désactiver le mode de déplacement du marqueur
  const toggleMarkerMovement = (): void => {
    setIsMovingMarker(!isMovingMarker);
  };

  // Mise à jour de la position du marqueur lorsque l'utilisateur appuie sur la carte
  const handleMapPress = (event: any): void => {
    // Ne rien faire si le mode de déplacement n'est pas activé
    if (!isMovingMarker) return;
    
    const { coordinate } = event.nativeEvent;
    setCurrentLocation(coordinate);
  };

  // Sauvegarde de la position actuelle avec son adresse
  const handleUseCurrentLocation = async (): Promise<void> => {
    if (!currentLocation) {
      Alert.alert(
        "Localisation non disponible",
        "Veuillez activer la localisation ou sélectionner un point sur la carte.",
        [{ text: "OK" }],
      );
      return;
    }

    try {
      const formattedAddress = await reverseGeocode(currentLocation);
      router.push({
        pathname: "/location/add-title",
        params: {
          coordinates: JSON.stringify(currentLocation),
          formattedAddress: formattedAddress.includes("Position:") ? "Position actuelle" : formattedAddress,
          type: "auto"
        }
      });
    } catch (error) {
      console.error("Erreur lors de la récupération de l'adresse:", error);
      Alert.alert(
        "Erreur",
        "Impossible de récupérer l'adresse. Veuillez réessayer.",
        [{ text: "OK" }],
      );
    }
  };

  // Sauvegarde de l'adresse avec titre
  const handleSaveAddress = async () => {
    if (!tempLocationData) return;
    
    try {
      // Préparer les données d'adresse pour le backend
      const addressData: Address = {
        title: addressTitle,
        address: tempLocationData.formattedAddress || "Adresse sélectionnée",
        street: tempLocationData.street || "",
        city: tempLocationData.city || "Abidjan",
        longitude: currentLocation?.longitude || 0,
        latitude: currentLocation?.latitude || 0
      };

      // Enregistrer l'adresse dans le backend
      const savedAddress = await addUserAddress(addressData);
      
      if (savedAddress) {
        // Mettre à jour le contexte de localisation
        await setLocationType("manual");
        await setAddressDetails({
          ...tempLocationData,
          title: addressTitle
        });
        
        setShowTitleModal(false);
        router.back();
      } else {
        throw new Error("Échec de l'enregistrement de l'adresse");
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'adresse:", error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de l'enregistrement de l'adresse",
        [{ text: "OK" }]
      );
    }
  };

  // Navigation vers la saisie manuelle d'adresse
  const handleAddAddressManually = () => {
    router.push("/location/manualset");
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <CustomStatusBar />
       <View className="px-3  mb-3">
       <View className="flex flex-row items-center justify-between">
      <TouchableOpacity onPress={() => router.back()}>
        <Image source={require("../../../assets/icons/arrow-back.png")} style={{ width: 30, height: 30, }} />
        </TouchableOpacity>
        <Text className="text-2xl font-sofia-medium">Localisation</Text>
        <View />
        </View>
       </View>
 
        <View style={{ flex: 1 }}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={ABIDJAN_REGION}
            showsUserLocation
            showsMyLocationButton={false}
            onPress={handleMapPress}
          >
            {currentLocation && (
              <Marker
                coordinate={currentLocation}
                draggable
                onDragEnd={handleMarkerDragEnd}
              >
                <Image
                  source={require("../../../assets/icons/location.png")}
                  style={{ width: 34, height: 32, resizeMode: "contain" }}
                />
              </Marker>
            )}
          </MapView>

          <TouchableOpacity
            onPress={getCurrentLocation}
            className="absolute right-4 bottom-[300px] z-50"
            disabled={isLocating}
          >
            <Image
              source={require("../../../assets/icons/target.png")}
              style={{ width: 55, height: 55, resizeMode: "contain" }}
            />
          </TouchableOpacity>

          {/* Bouton pour activer/désactiver le mode de déplacement
          <TouchableOpacity
            style={styles.moveButton}
            onPress={toggleMarkerMovement}
          >
            <Text style={styles.moveButtonText}>
              {isMovingMarker ? "Terminer" : "Déplacer le marqueur"}
            </Text>
          </TouchableOpacity> */}
          
          {/* Message d'aide pour le déplacement */}
          {isMovingMarker && (
            <View style={styles.helpBanner}>
              <Text style={styles.helpText}>
                Appuyez sur la carte pour déplacer le marqueur
              </Text>
            </View>
          )}

          {isLocating && (
            <View className="absolute inset-0 flex items-center justify-center bg-black/10">
              <Spinner />
            </View>
          )}
        </View>
      </View>

      <LocationBottomSheet
        onUseCurrentLocation={handleUseCurrentLocation}
        onAddAddressManually={handleAddAddressManually}
      />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  moveButton: {
    position: 'absolute',
    bottom: 200,
    right: 16,
    backgroundColor: '#FF6B00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  moveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  helpBanner: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  helpText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Location;
