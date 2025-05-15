import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  Modal,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import BackButtonTwo from "@/components/ui/BackButtonTwo";
import { StatusBar } from "expo-status-bar";
import GradientButton from "@/components/ui/GradientButton";
import { useLocation } from "../../context/LocationContext";
import SuccessModal from "@/components/ui/SuccessModal";
import debounce from "lodash/debounce";
import DynamicHeader from "@/components/home/DynamicHeader";
import { addUserAddress, Address } from "@/services/api/address";
import { useAuth } from "@/app/context/AuthContext"; 
import { MapPin } from 'lucide-react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

/**
 * Interface pour les données du formulaire d'adresse
 */
interface AddressFormData {
  city: string;
  postalCode: string;
  address: string; // rue
  streetNumber: string;
  residenceName: string;
  doorNumber: string;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    house_number?: string;
    city?: string;
    postcode?: string;
    country?: string;
  };
}

/**
 * Écran pour ajouter manuellement une adresse
 */
const ManualSetLocation: React.FC = (): JSX.Element => {
  const [formData, setFormData] = useState<AddressFormData>({
    city: "",
    postalCode: "",
    address: "",
    streetNumber: "",
    residenceName: "",
    doorNumber: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showTitleModal, setShowTitleModal] = useState<boolean>(false);
  const [addressTitle, setAddressTitle] = useState<string>("");
  const [tempFormData, setTempFormData] = useState<AddressFormData | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [addressText, setAddressText] = useState<string>("");

  const router = useRouter();
  const { setAddressDetails, setLocationType, clearLocationData, setCoordinates } =
    useLocation();

  const googlePlacesRef = useRef(null);
  const [searchFocused, setSearchFocused] = useState(false);

  /**
   * Met à jour un champ du formulaire
   */
  const handleInputChange = (
    field: keyof AddressFormData,
    value: string,
  ): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Formate l'adresse pour l'affichage
   */
  const formatAddress = (data: AddressFormData): string => {
    const parts = [];

    if (data.streetNumber) parts.push(data.streetNumber);
    if (data.address) parts.push(data.address);
    if (data.residenceName) parts.push(data.residenceName);
    if (data.doorNumber) parts.push(`Porte ${data.doorNumber}`);

    let formattedAddress = parts.join(", ");

    if (data.city || data.postalCode) {
      const locationParts = [];
      if (data.city) locationParts.push(data.city);
      if (data.postalCode) locationParts.push(data.postalCode);
      formattedAddress += " - " + locationParts.join(" ");
    }

    return formattedAddress;
  };

  const handleValidateForm = (): void => {
    if (!formData.address) {
      Alert.alert(
        "Champ obligatoire",
        "Veuillez renseigner au moins votre adresse",
        [{ text: "OK" }],
      );
      return;
    }

    setTempFormData(formData);
    setShowTitleModal(true);
  };

  /**
   * Enregistre l'adresse et affiche le modal de succès
   */
  const handleSaveAddress = async (): Promise<void> => {
    if (!tempFormData) return;

    try {
      setIsLoading(true);
      await clearLocationData();

      const formattedAddress = formatAddress(tempFormData);

      // S'assurer que l'adresse n'est pas vide
      if (!formattedAddress.trim()) {
        Alert.alert(
          "Champ obligatoire",
          "L'adresse ne peut pas être vide",
          [{ text: "OK" }]
        );
        setIsLoading(false);
        return;
      }

      // Préparer les données d'adresse pour le backend
      const addressData: Address = {
        title: addressTitle || "Adresse", // Valeur par défaut si le titre est vide
        address: formattedAddress,
        street: tempFormData.address || formattedAddress,
        city: tempFormData.city || "Abidjan",
        longitude: selectedLocation?.longitude || -4.0082,
        latitude: selectedLocation?.latitude || 5.3599
      };

      // Enregistrer l'adresse dans le backend
      console.log("Données d'adresse envoyées:", JSON.stringify(addressData, null, 2));
      const savedAddress = await addUserAddress(addressData);
      
      if (savedAddress) {
        console.log("Adresse enregistrée avec succès:", savedAddress);
        
        // Mettre à jour le contexte de localisation
        const addressDetails = {
          ...tempFormData,
          formattedAddress,
          title: addressTitle || "Adresse",
        };

        await setLocationType("manual");
        await new Promise((resolve) => setTimeout(resolve, 100));
        await setAddressDetails(addressDetails);
        
        if (savedAddress.latitude && savedAddress.longitude) {
          await setCoordinates({
            latitude: savedAddress.latitude,
            longitude: savedAddress.longitude
          });
        } else {
          // Utiliser les coordonnées par défaut
          await setCoordinates({
            latitude: addressData.latitude,
            longitude: addressData.longitude
          });
        }

        setIsLoading(false);
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
        [{ text: "OK" }],
      );
      setIsLoading(false);
    }
  };

  /**
   * Ferme le modal de succès et redirige vers l'écran principal
   */
  const handleModalClose = (): void => {
    setShowSuccessModal(false);
    // Redirection vers l'écran principal
    router.replace("/(tabs-guest)/");
  };

  // Fonction de recherche avec debounce
  const searchPlaces = debounce(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // Utiliser l'API Google Places Autocomplete
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query + ' Abidjan')}&types=address&language=fr&components=country:ci&key=AIzaSyDL_YVgedC-WgiLBHuYlZ1MA8Rgl470OBY`
      );
      const data = await response.json();
      if (data.status === 'OK') {
        // Adapter le format des résultats
        const results = data.predictions.map((item: any) => ({
          place_id: item.place_id,
          display_name: item.description,
        }));
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche Google Places:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, 500);

  useEffect(() => {
    searchPlaces(searchQuery);
  }, [searchQuery]);

  const handleSelectLocation = async (result: SearchResult) => {
    try {
      console.log('Selected location:', result);
      // Utiliser Google Geocoding pour obtenir les coordonnées
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${result.place_id}&fields=geometry,formatted_address,address_component&language=fr&key=AIzaSyDL_YVgedC-WgiLBHuYlZ1MA8Rgl470OBY`
      );
      const data = await response.json();
      if (data.status === 'OK') {
        const location = data.result.geometry.location;
        const formattedAddress = data.result.formatted_address;
        const coordinates = {
          latitude: location.lat,
          longitude: location.lng
        };
        
        // Vérifier que les coordonnées sont valides
        if (!coordinates.latitude || !coordinates.longitude) {
          throw new Error('Coordonnées invalides');
        }

        console.log('Coordonnées sélectionnées:', coordinates);
        console.log('Adresse formatée:', formattedAddress);

        setSelectedLocation(coordinates);
        setAddressText(formattedAddress);
        
        // Extraire la ville de l'adresse formatée
        const addressParts = formattedAddress.split(',');
        const city = addressParts[1]?.trim() || 'Abidjan';
        
        // Rediriger vers add-title avec les données de l'adresse
        router.push({
          pathname: '/(common)/location/add-title',
          params: {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            address: formattedAddress,
            city: city,
            street: addressParts[0]?.trim() || formattedAddress
          }
        });
      } else {
        throw new Error('Impossible de récupérer les détails du lieu');
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'adresse:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la sélection de l\'adresse',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView className="mt-8 pl-4" style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBar style="dark" />
      
      {/* Header avec retour + logo + panier */}
      <DynamicHeader
        displayType="back-with-logo"
        showCart={true}
        title="Rechercher une adresse"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <View className="flex-1 bg-white">
          {/* Barre de recherche */}
          <View className="px-6 mt-4">
            <GooglePlacesAutocomplete
              ref={googlePlacesRef}
              placeholder="Rechercher une adresse..."
              onPress={async (data, details = null) => {
                if (!details || !details.geometry) return;
                const location = {
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                };
                
                // Vérifier que les coordonnées sont valides
                if (!location.latitude || !location.longitude) {
                  Alert.alert('Erreur', 'Coordonnées invalides');
                  return;
                }

                console.log('Coordonnées sélectionnées:', location);
                console.log('Adresse formatée:', details.formatted_address);

                setSelectedLocation(location);
                setAddressText(details.formatted_address);

                // Extraire la ville de l'adresse formatée
                const addressParts = details.formatted_address.split(',');
                const city = addressParts[1]?.trim() || 'Abidjan';

                router.push({
                  pathname: '/(common)/location/add-title',
                  params: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    address: details.formatted_address,
                    city: city,
                    street: addressParts[0]?.trim() || details.formatted_address
                  }
                });
              }}
              query={{
                key: 'AIzaSyDL_YVgedC-WgiLBHuYlZ1MA8Rgl470OBY',
                language: 'fr',
                components: 'country:ci',
                types: ['address', 'establishment', 'geocode'],
                location: '5.3599,-4.0082', // Coordonnées d'Abidjan
                radius: '50000', // 50km autour d'Abidjan
                strictbounds: true
              }}
              fetchDetails={true}
              enablePoweredByContainer={false}
              textInputProps={{
                onFocus: () => setSearchFocused(true),
                onBlur: () => setSearchFocused(false),
                placeholderTextColor: '#666',
                autoCorrect: false,
                autoCapitalize: 'none',
                returnKeyType: 'search'
              }}
              styles={{
                container: {
                  flex: 0,
                  zIndex: 9999,
                  position: 'relative'
                },
                textInputContainer: {
                  backgroundColor: 'white',
                  borderTopWidth: 0,
                  borderBottomWidth: 0,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#eee',
                  marginBottom: 4,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3
                },
                textInput: {
                  height: 44,
                  fontSize: 16,
                  color: '#222',
                  paddingLeft: 40,
                  backgroundColor: 'transparent'
                },
                listView: {
                  backgroundColor: 'white',
                  borderRadius: 8,
                  marginTop: 2,
                  borderWidth: 1,
                  borderColor: '#eee',
                  position: 'absolute',
                  top: 45,
                  left: 0,
                  right: 0,
                  zIndex: 9999,
                  elevation: 3,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4
                },
                row: {
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 13,
                  height: 44,
                  backgroundColor: 'white'
                },
                description: {
                  fontSize: 15,
                  color: '#222'
                },
                separator: {
                  height: 1,
                  backgroundColor: '#eee'
                },
                poweredContainer: {
                  display: 'none'
                },
                predefinedPlacesDescription: {
                  color: '#1faadb'
                }
              }}
              renderLeftButton={() => (
                <View className="pl-2 justify-center">
                  <MapPin size={18} color="#666" />
                </View>
              )}
              renderRow={(data) => (
                <View className="flex-row items-center">
                  <View className="mr-2">
                    <MapPin size={16} color="#666" />
                  </View>
                  <View>
                    <Text className="font-semibold text-gray-800">
                      {data.structured_formatting?.main_text || data.description}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {data.structured_formatting?.secondary_text || ''}
                    </Text>
                  </View>
                </View>
              )}
              listViewDisplayed={searchFocused}
              keyboardShouldPersistTaps="handled"
              minLength={2}
              debounce={300}
              nearbyPlacesAPI="GooglePlacesSearch"
              GooglePlacesDetailsQuery={{
                fields: 'geometry,formatted_address,address_component',
                language: 'fr'
              }}
            />
          </View>

          {/* Liste des résultats */}
          <ScrollView className="flex-1 px-6">
            {isLoading ? (
              <ActivityIndicator size="large" color="#F17922" className="mt-4" />
            ) : (
              searchResults.map((result) => {
                // Découper le display_name en titre et sous-titre
                const [mainText, ...rest] = result.display_name.split(',');
                const secondaryText = rest.join(',').trim();
                return (
                  <TouchableOpacity
                    key={result.place_id}
                    onPress={() => handleSelectLocation(result)}
                    className="flex-row items-center py-4 border-b border-gray-100"
                  >
                    <View className="w-8 h-8 mr-3 items-center justify-center bg-[#F3F4F6] rounded-full">
                      <MapPin size={18} color="#666" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-sofia-medium text-gray-900" numberOfLines={1}>
                        {mainText}
                      </Text>
                      {secondaryText ? (
                        <Text className="text-xs text-gray-500" numberOfLines={1}>
                          {secondaryText}
                        </Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Modal pour le titre de l'adresse */}
      <Modal
        visible={showTitleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTitleModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-end">
            <View className="bg-white rounded-t-3xl p-6">
              <Text className="text-xl font-sofia-medium text-center mb-6">
                Nouvelle adresse enregistrée
              </Text>
              <Text className="text-base font-sofia-regular mb-2">
                Titre
              </Text>
              <TextInput
                value={addressTitle}
                onChangeText={setAddressTitle}
                placeholder="Ex: Maison, Bureau, etc."
                className="border border-gray-200 rounded-xl p-4 mb-6"
              />
              <View className="flex-row space-x-4">
                <TouchableOpacity
                  onPress={() => {
                    setShowTitleModal(false);
                    setAddressTitle("");
                  }}
                  className="flex-1 border border-orange-500 rounded-full p-4"
                >
                  <Text className="text-orange-500 text-center font-sofia-medium">
                    Ignorer
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveAddress}
                  className="flex-1 bg-orange-500 rounded-full p-4"
                >
                  <Text className="text-white text-center font-sofia-medium">
                    Enregistrer
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal de succès */}
      <SuccessModal
        visible={showSuccessModal}
        message="Votre adresse a été enregistrée avec succès."
        onClose={handleModalClose}
      />
    </SafeAreaView>
  );
};

export default ManualSetLocation;
