import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { useLocation } from "@/app/context/LocationContext";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Affiche et gère la location actuelle dans l'en-tête de l'application
 */
const HomeLocation: React.FC = () => {
  const { locationData, refreshLocationData } = useLocation();
  const [displayAddress, setDisplayAddress] = useState<string>(
    "Localisation actuelle",
  );
  const locationIcon = require("../../assets/icons/localisation.png");

  // Rafraîchir les données de localisation lors de la mise au premier plan du composant
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        await refreshLocationData();
        updateDisplayAddress();
      };

      fetchData();

      
    }, []),
  );

  /**
   * Met à jour l'adresse affichée quand les données de localisation changent
   */
  useEffect(() => {
    updateDisplayAddress();
  }, [locationData]);

  /**
   * Charge directement les données depuis AsyncStorage pour garantir leur fraîcheur
   */
  const loadFreshLocationData = async (): Promise<void> => {
    try {
      const storedData = await AsyncStorage.getItem("locationData");
      if (storedData) {
        const parsedData = JSON.parse(storedData);

        // Mettre à jour directement l'adresse affichée avec les données fraîches
        updateAddressFromData(parsedData);
      } else {
        setDisplayAddress("Localisation actuelle");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données fraîches:", error);
    }
  };

  /**
   * Convertit les coordonnées en une adresse 
   */
  const getFormattedAddressFromCoordinates = (coords): string => {
    // Ne pas afficher les coordonnées brutes, retourner un texte 
    return "Position actuelle";
  };

  /**
   * Mise à jour de l'adresse affichée à partir des données fournies
   */
  const updateAddressFromData = (data): void => {
    if (!data || (!data.addressDetails && !data.coordinates)) {
      setDisplayAddress("Localisation actuelle");
      return;
    }

    // L'adresse formatée existe et ne contient pas de coordonnées brutes
    if (
      data.addressDetails?.formattedAddress &&
      !data.addressDetails.formattedAddress.includes("Position:")
    ) {
      const address = data.addressDetails.formattedAddress;

      // Tronquer l'adresse si elle est trop longue
      const MAX_LENGTH = 35;
      if (address.length > MAX_LENGTH) {
        setDisplayAddress(address.substring(0, MAX_LENGTH - 3) + "...");
      } else {
        setDisplayAddress(address);
      }
    }
    // Si l'adresse formatée contient des coordonnées, ou si on a des coordonnées mais pas d'adresse
    else if (
      data.coordinates ||
      (data.addressDetails?.formattedAddress &&
        data.addressDetails.formattedAddress.includes("Position:"))
    ) {
      setDisplayAddress("Position actuelle");
    }
    // Fallback
    else {
      setDisplayAddress("Localisation actuelle");
    }
  };

  /**
   * Formate et met à jour l'adresse à afficher selon le type de localisation
   */
  const updateDisplayAddress = async (): Promise<void> => {
    // Charger directement depuis AsyncStorage pour garantir les données les plus récentes
    await loadFreshLocationData();
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
