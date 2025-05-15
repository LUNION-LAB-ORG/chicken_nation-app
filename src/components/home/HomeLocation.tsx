import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import useLocationStore from "@/store/locationStore";

/**
 * Affiche et gère la location actuelle dans l'en-tête de l'application
 */
const HomeLocation: React.FC = () => {
  const { addressDetails, locationType } = useLocationStore();
  const [displayAddress, setDisplayAddress] = useState<string>("Localisation actuelle");
  const locationIcon = require("../../assets/icons/localisation.png");

  // Rafraîchir les données de localisation quand l'adresse change ou quand l'écran est focus
  useFocusEffect(
    React.useCallback(() => {
      updateDisplayAddress();
    }, [addressDetails])
  );

  // Effet pour le débogage
  useEffect(() => {
    console.log('HomeLocation - addressDetails:', addressDetails);
    console.log('HomeLocation - locationType:', locationType);
  }, [addressDetails, locationType]);

  /**
   * Formate et met à jour l'adresse à afficher
   */
  const updateDisplayAddress = (): void => {
    console.log('updateDisplayAddress called with:', addressDetails);
    
    // Si nous avons une adresse définie dans le store, l'utiliser
    if (addressDetails?.formattedAddress) {
      const address = addressDetails.formattedAddress;
      console.log('Using formatted address:', address);
      
      // Tronquer l'adresse si elle est trop longue
      const MAX_LENGTH = 35;
      if (address.length > MAX_LENGTH) {
        setDisplayAddress(address.substring(0, MAX_LENGTH - 3) + "...");
      } else {
        setDisplayAddress(address);
      }
    } else if (addressDetails?.address) {
      // Fallback sur l'adresse simple si formattedAddress n'existe pas
      console.log('Using simple address:', addressDetails.address);
      const address = addressDetails.address;
      const MAX_LENGTH = 35;
      if (address.length > MAX_LENGTH) {
        setDisplayAddress(address.substring(0, MAX_LENGTH - 3) + "...");
      } else {
        setDisplayAddress(address);
      }
    } else {
      // Si aucune adresse n'est définie, afficher le message par défaut
      console.log('No address found, using default message');
      setDisplayAddress("Localisation actuelle");
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
