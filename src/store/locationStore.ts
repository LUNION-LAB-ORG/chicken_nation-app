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
  addressId?: string;
  street?: string;
  neighborhood?: string;
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
        console.log('setCoordinates called with:', coords);
        set({ coordinates: coords });
      },
      
      // Définir les détails d'adresse
      setAddressDetails: async (details) => {
        console.log('setAddressDetails called with:', details);
        try {
          // Si nous avons des coordonnées, utiliser l'API Google Geocoding
          const { coordinates } = get();
          if (coordinates) {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.latitude},${coordinates.longitude}&language=fr&key=AIzaSyDL_YVgedC-WgiLBHuYlZ1MA8Rgl470OBY`
            );
            const data = await response.json();

            if (data.status === 'OK' && data.results.length > 0) {
              const result = data.results[0];
              const addressComponents = result.address_components;
              
              // Extraire les composants de l'adresse
              const streetNumber = addressComponents?.find((component: any) => 
                component.types.includes('street_number'))?.long_name || '';
              const route = addressComponents?.find((component: any) => 
                component.types.includes('route'))?.long_name || '';
              const city = addressComponents?.find((component: any) => 
                component.types.includes('locality'))?.long_name || 'Abidjan';
              const neighborhood = addressComponents?.find((component: any) => 
                component.types.includes('neighborhood'))?.long_name || '';
              
              // Construire une adresse plus propre
              const streetAddress = `${streetNumber} ${route}`.trim();
              
              // Mettre à jour les détails avec l'adresse nettoyée
              details = {
                ...details,
                formattedAddress: streetAddress,
                street: streetAddress,
                city: city,
                neighborhood: neighborhood,
                road: route,
                streetNumber: streetNumber
              };
            }
          }

          // Ne jamais afficher les coordonnées brutes
          if (
            details.formattedAddress &&
            details.formattedAddress.includes("Position:")
          ) {
            details.formattedAddress = "Position actuelle";
          }

          console.log('Setting address details to:', details);
          set({ addressDetails: details });
        } catch (error) {
          console.error("Erreur lors de la mise à jour de l'adresse:", error);
          // En cas d'erreur, utiliser les détails fournis tels quels
          set({ addressDetails: details });
        }
      },
      
      // Définir le type de localisation
      setLocationType: (type) => {
        console.log('setLocationType called with:', type);
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
        
        if (!addressDetails) {
          return "Localisation actuelle";
        }

        // Construire l'adresse à partir des composants disponibles
        const parts = [];

        // Ajouter la rue si disponible
        if (addressDetails.street) {
          parts.push(addressDetails.street);
        } else if (addressDetails.road) {
          // Fallback sur road si street n'est pas disponible
          if (addressDetails.streetNumber) {
            parts.push(`${addressDetails.streetNumber} ${addressDetails.road}`);
          } else {
            parts.push(addressDetails.road);
          }
        }

        // Ajouter le quartier si disponible
        if (addressDetails.neighborhood) {
          parts.push(addressDetails.neighborhood);
        }

        // Ajouter la ville si disponible
        if (addressDetails.city) {
          parts.push(addressDetails.city);
        }

        // Si nous avons des parties d'adresse, les joindre
        if (parts.length > 0) {
          return parts.join(", ");
        }

        // Si nous avons une adresse formatée brute, l'utiliser
        if (addressDetails.formattedAddress) {
          // Nettoyer l'adresse formatée
          let cleanAddress = addressDetails.formattedAddress
            .replace(/\d{2}[A-Z]\d\+[A-Z]{2}\d/, '') // Retire les codes postaux comme 72P9+FX8
            .replace(/\s*,\s*/g, ', ') // Normalise les espaces autour des virgules
            .replace(/,\s*,/g, ',') // Retire les virgules doubles
            .replace(/^\s*,\s*/, '') // Retire la virgule au début
            .replace(/,\s*$/, '') // Retire la virgule à la fin
            .trim();

          if (cleanAddress) {
            return cleanAddress;
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
