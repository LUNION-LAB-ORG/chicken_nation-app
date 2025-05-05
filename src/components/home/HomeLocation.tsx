import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import useLocationStore from "@/store/locationStore";

/**
 * Affiche et gère la location actuelle dans l'en-tête de l'application
 */
const HomeLocation: React.FC = () => {
  const { addressDetails, coordinates, setCoordinates, setAddressDetails, setLocationType, getFormattedAddress } = useLocationStore();
  const [displayAddress, setDisplayAddress] = useState<string>("Localisation actuelle");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const locationIcon = require("../../assets/icons/localisation.png");

  // Rafraîchir les données de localisation lors de la mise au premier plan du composant
  useFocusEffect(
    React.useCallback(() => {
      updateDisplayAddress();
      
      // Demander la permission et obtenir la localisation actuelle
      requestLocationPermission();
    }, [])
  );

  /**
   * Met à jour l'adresse affichée quand les données de localisation changent
   */
  useEffect(() => {
    updateDisplayAddress();
  }, [addressDetails, coordinates]);

  /**
   * Demande la permission d'accéder à la localisation et récupère la position actuelle
   */
  const requestLocationPermission = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Demander la permission d'accéder à la localisation
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert(
          "Permission refusée",
          "Nous avons besoin de votre permission pour accéder à votre localisation."
        );
        setIsLoading(false);
        return;
      }
      
      // Obtenir la localisation actuelle
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      
      // Mettre à jour les coordonnées dans le store
      setCoordinates({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      
      // Effectuer le geocoding inverse pour obtenir l'adresse
      await reverseGeocode(location.coords.latitude, location.coords.longitude);
      
      // Définir le type de localisation comme automatique
      setLocationType("auto");
      
    } catch (error) {
      console.error("Erreur lors de la récupération de la localisation:", error);
      Alert.alert(
        "Erreur",
        "Impossible d'obtenir votre localisation. Veuillez réessayer."
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Convertit les coordonnées en une adresse (geocoding inverse)
   */
  const reverseGeocode = async (latitude: number, longitude: number): Promise<void> => {
    try {
      // Utiliser l'API de geocoding inverse de Nominatim (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            "User-Agent": "ChickenNationApp",
            "Accept-Language": "fr"
          }
        }
      );
      
      const data = await response.json();
      
      if (data && data.address) {
        // Extraire les informations pertinentes de l'adresse
        const addressDetails = {
          road: data.address.road || "",
          city: data.address.city || data.address.town || data.address.village || "",
          postalCode: data.address.postcode || "",
          formattedAddress: data.display_name || "",
          address: data.address.road || ""
        };
        
        // Mettre à jour les détails de l'adresse dans le store
        setAddressDetails(addressDetails);
      }
    } catch (error) {
      console.error("Erreur lors du geocoding inverse:", error);
      // En cas d'erreur, définir une adresse par défaut
      setAddressDetails({
        formattedAddress: "Localisation en cours..."
      });
    }
  };

  /**
   * Formate et met à jour l'adresse à afficher
   */
  const updateDisplayAddress = (): void => {
    const address = getFormattedAddress();
    
    // Tronquer l'adresse si elle est trop longue
    const MAX_LENGTH = 35;
    if (address.length > MAX_LENGTH) {
      setDisplayAddress(address.substring(0, MAX_LENGTH - 3) + "...");
    } else {
      setDisplayAddress(address);
    }
  };

  /**
   * Gérer le clic sur le bouton de modification de la localisation
   */
  const handleModifyLocation = (): void => {
    router.push("/location");
  };

  return (
    <View className="my-6">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 mr-2">
          <Image
            source={locationIcon}
            style={{ width: 24, height: 24, resizeMode: "contain" }}
            accessibilityLabel="Icône de localisation"
          />
          <Text
            className="ml-3 font-sofia-regular text-black text-sm flex-shrink"
            numberOfLines={1}
            accessibilityLabel={`Adresse actuelle: ${displayAddress}`}
          >
            {displayAddress}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleModifyLocation}
          className="bg-yellow rounded-full px-4 py-2"
          accessibilityLabel="Modifier la localisation"
        >
          <Text className="font-sofia-regular text-black text-sm">
            MODIFIER
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeLocation;
