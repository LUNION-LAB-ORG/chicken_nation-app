import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Interface pour les coordonnées géographiques
 */
interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Interface pour les détails d'adresse stockés
 */
interface AddressDetails {
  road?: string;
  city?: string;
  postalCode?: string;
  address?: string;
  streetNumber?: string;
  residenceName?: string;
  doorNumber?: string;
  formattedAddress?: string;
  title?: string;
}

/**
 * Interface pour l'ensemble des données de localisation
 */
interface LocationData {
  coordinates: Coordinates | null;
  addressDetails: AddressDetails | null;
  locationType: "auto" | "manual" | null;
}

/**
 * Interface pour le contexte de localisation exposé aux composants
 */
interface LocationContextType {
  locationData: LocationData;
  setCoordinates: (coords: Coordinates) => Promise<void>;
  setAddressDetails: (details: AddressDetails) => Promise<void>;
  setLocationType: (type: "auto" | "manual") => Promise<void>;
  clearLocationData: () => Promise<void>;
  reverseGeocode: (coords: Coordinates) => Promise<string>;
  refreshLocationData: () => Promise<void>;
}

// Clé pour le stockage dans AsyncStorage
const LOCATION_STORAGE_KEY = "locationData";

// Données initiales de localisation
const initialLocationData: LocationData = {
  coordinates: null,
  addressDetails: null,
  locationType: null,
};

// Création du contexte avec des valeurs par défaut
const LocationContext = createContext<LocationContextType>({
  locationData: initialLocationData,
  setCoordinates: async () => {},
  setAddressDetails: async () => {},
  setLocationType: async () => {},
  clearLocationData: async () => {},
  reverseGeocode: async () => "",
  refreshLocationData: async () => {},
});

/**
 * Hook pour accéder facilement au contexte de localisation
 */
export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error(
      "useLocation doit être utilisé au sein d'un LocationProvider",
    );
  }
  return context;
};

/**
 * Provider pour gérer les données de localisation
 * Expose les méthodes pour manipuler l'état de la localisation et gère la persistance
 */
export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [locationData, setLocationData] =
    useState<LocationData>(initialLocationData);

  /**
   * Charge les données de localisation depuis AsyncStorage au démarrage
   */
  const loadLocationData = async (): Promise<void> => {
    try {
      const storedLocationData =
        await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
      if (storedLocationData) {
        const parsedData = JSON.parse(storedLocationData);
        setLocationData(parsedData);
      }
    } catch (error) {
      console.error(
        "Erreur lors du chargement des données de localisation:",
        error,
      );
    }
  };

  useEffect(() => {
    loadLocationData();
  }, []);

  /**
   * Fonction pour rafraîchir manuellement les données de localisation
   */
  const refreshLocationData = async (): Promise<void> => {
    await loadLocationData();
  };

  /**
   * Sauvegarde les données de localisation dans AsyncStorage
   */
  const saveLocationData = async (newData: LocationData): Promise<void> => {
    try {
      // Vérifier si l'adresse formatée contient des coordonnées brutes
      if (
        newData.addressDetails?.formattedAddress &&
        newData.addressDetails.formattedAddress.includes("Position:")
      ) {
       
        newData.addressDetails.formattedAddress = "Position actuelle";
      }

      
      await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newData));
      // Mise à jour de l'état après sauvegarde réussie
      setLocationData(newData);
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde des données de localisation:",
        error,
      );
    }
  };

  /**
   * Met à jour les coordonnées géographiques
   */
  const setCoordinates = async (coords: Coordinates): Promise<void> => {
    const newData = {
      ...locationData,
      coordinates: coords,
    };
    await saveLocationData(newData);
  };

  /**
   * Met à jour les détails d'adresse 
   */
  const setAddressDetails = async (details: AddressDetails): Promise<void> => {
 
    // Si aucune adresse formatée n'est fournie, essayer de la construire
    if (!details.formattedAddress || details.formattedAddress.trim() === "") {
      
      const parts = [];
      if (details.streetNumber) parts.push(details.streetNumber);
      if (details.road) parts.push(details.road);
      if (details.address) parts.push(details.address);
      if (details.residenceName) parts.push(details.residenceName);
      if (details.doorNumber) parts.push(`Porte ${details.doorNumber}`);

      const locationParts = [];
      if (details.city) locationParts.push(details.city);
      if (details.postalCode) locationParts.push(details.postalCode);

      let formattedAddress = parts.join(", ");
      if (locationParts.length > 0) {
        formattedAddress += (formattedAddress ? " - " : "") + locationParts.join(" ");
      }

      details.formattedAddress = formattedAddress || details.address || "";
    }

    // Ne jamais afficher les coordonnées brutes
    if (
      details.formattedAddress &&
      details.formattedAddress.includes("Position:")
    ) {
      details.formattedAddress = "Position actuelle";
    }

    // S'assurer que l'adresse n'est pas vide
    if (!details.formattedAddress || details.formattedAddress.trim() === "") {
      if (details.address) {
        details.formattedAddress = details.address;
      } else if (details.city) {
        details.formattedAddress = details.city;
      }
    }

    const newData = {
      ...locationData,
      addressDetails: details,
    };

    await saveLocationData(newData);
  };

  /**
   * Définit le type de localisation (automatique ou manuelle)
   */
  const setLocationType = async (type: "auto" | "manual"): Promise<void> => {
    const newData = {
      ...locationData,
      locationType: type,
    };
    await saveLocationData(newData);
    console.log(`Nouvelle Adresse : ${type}`);
  };

  /**
   * Efface complètement les données de localisation pour éviter tout conflit
   */
  const clearLocationData = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(LOCATION_STORAGE_KEY);
      setLocationData(initialLocationData);
      console.log("Données de localisation effacées");
    } catch (error) {
      console.error(
        "Erreur lors de la suppression des données de localisation:",
        error,
      );
    }
  };

  /**
   * Fonction pour convertir les coordonnées en adresse (reverse geocoding) avec OpenStreetMap
   * Respecte les conditions d'utilisation de Nominatim
   */
  const reverseGeocode = async (coords: Coordinates): Promise<string> => {
    try {
      const { latitude, longitude } = coords;

      // Ajout des headers requis par Nominatim
      const headers = {
        "User-Agent": "ChickenNationApp/1.0",
        "Accept-Language": "fr-FR,fr",
      };

      // Construction de l'URL avec les paramètres nécessaires
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
      console.log(`Requête de géocodage inverse: ${url}`);

      const response = await fetch(url, { headers });

      if (!response.ok) {
        console.error(
          `Erreur du serveur: ${response.status} ${response.statusText}`,
        );
        throw new Error(`Erreur du serveur: ${response.status}`);
      }

      const data = await response.json();

      // Si une adresse structurée est disponible, on la formate
      if (data.address) {
        const address = data.address;
        const parts = [];

        if (address.road) parts.push(address.road);
        if (address.house_number) parts.push(address.house_number);
        if (address.suburb) parts.push(address.suburb);

        const cityParts = [];
        if (address.postcode) cityParts.push(address.postcode);
        if (address.city || address.town || address.village) {
          cityParts.push(address.city || address.town || address.village);
        }

        if (cityParts.length > 0) {
          parts.push(cityParts.join(" "));
        }

        if (parts.length > 0) {
          return parts.join(", ");
        }
      }

      // Si on ne peut pas construire une adresse formatée, on utilise display_name
      return data.display_name || "Position actuelle";
    } catch (error) {
      console.error("Erreur de reverse geocoding:", error);
      // En cas d'erreur, retourner un texte 
      return "Position actuelle";
    }
  };

  // Valeurs et méthodes exposées via le contexte
  const contextValue: LocationContextType = {
    locationData,
    setCoordinates,
    setAddressDetails,
    setLocationType,
    clearLocationData,
    reverseGeocode,
    refreshLocationData,
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};

export default LocationContext;
