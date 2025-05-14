import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Interface pour les coordonnées géographiques
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Interface pour les détails d'adresse stockés
 */
export interface AddressDetails {
  road?: string;
  city?: string;
  postalCode?: string;
  address?: string;
  streetNumber?: string;
  residenceName?: string;
  doorNumber?: string;
  formattedAddress?: string;
  title?: string;
  addressId?: string; // ID de l'adresse sélectionnée
}

/**
 * Interface pour l'état du store de localisation
 */
interface LocationState {
  // État
  coordinates: Coordinates | null;
  addressDetails: AddressDetails | null;
  locationType: "auto" | "manual" | null;
  selectedAddressId: string | null;
  
  // Actions
  setCoordinates: (coords: Coordinates) => void;
  setAddressDetails: (details: AddressDetails) => void;
  setLocationType: (type: "auto" | "manual") => void;
  setSelectedAddressId: (id: string | null) => void;
  clearLocationData: () => void;
  getFormattedAddress: () => string;
}

/**
 * Store pour gérer les données de localisation
 */
const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      // État initial
      coordinates: null,
      addressDetails: null,
      locationType: null,
      selectedAddressId: null,
      
      // Définir les coordonnées géographiques
      setCoordinates: (coords) => {
        const { locationType } = get();
        // Ne pas mettre à jour les coordonnées si une adresse manuelle est sélectionnée
        if (locationType === "manual") {
          console.log("Mise à jour des coordonnées ignorée car une adresse manuelle est sélectionnée");
          return;
        }
        set({ coordinates: coords });
      },
      
      // Définir les détails d'adresse
      setAddressDetails: (details) => {
        const { locationType } = get();
        // Ne pas mettre à jour l'adresse si une adresse manuelle est sélectionnée
        if (locationType === "manual") {
          console.log("Mise à jour de l'adresse ignorée car une adresse manuelle est sélectionnée");
          return;
        }

        // Formater l'adresse si nécessaire
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

        set({ addressDetails: details });
      },
      
      // Définir le type de localisation
      setLocationType: (type) => {
        set({ locationType: type });
      },
      
      // Définir l'ID de l'adresse sélectionnée
      setSelectedAddressId: (id) => {
        set({ selectedAddressId: id });
      },
      
      // Effacer toutes les données de localisation
      clearLocationData: () => {
        set({
          coordinates: null,
          addressDetails: null,
          locationType: null,
          selectedAddressId: null
        });
      },
      
      // Obtenir l'adresse formatée pour l'affichage
      getFormattedAddress: () => {
        const { addressDetails } = get();
        
        // Vérifier si nous avons une adresse formatée
        if (addressDetails?.formattedAddress && 
            addressDetails.formattedAddress !== "Position actuelle") {
          // Limiter la longueur de l'adresse formatée pour l'affichage
          const formattedAddress = addressDetails.formattedAddress;
          const MAX_LENGTH = 100; // Longueur maximale pour l'adresse
          
          if (formattedAddress.length > MAX_LENGTH) {
            return formattedAddress.substring(0, MAX_LENGTH) + "...";
          }
          
          return formattedAddress;
        }
        
        // Essayer de construire une adresse à partir des champs disponibles
        if (addressDetails) {
          const parts = [];
          
          // Ajouter l'adresse principale si disponible
          if (addressDetails.address) {
            parts.push(addressDetails.address);
          }
          
          // Ajouter la ville si disponible
          if (addressDetails.city) {
            parts.push(addressDetails.city);
          }
          
          // Si nous avons des parties d'adresse, les joindre
          if (parts.length > 0) {
            return parts.join(", ");
          }
        }
        
        // Si aucune adresse n'est disponible, afficher le message par défaut
        return "Localisation actuelle";
      }
    }),
    {
      name: 'location-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useLocationStore;
