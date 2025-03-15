import React, { useState, useEffect } from "react";
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

  const router = useRouter();
  const { setAddressDetails, setLocationType, clearLocationData, setCoordinates } =
    useLocation();

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

      const addressDetails = {
        ...tempFormData,
        formattedAddress,
        title: addressTitle,
      };

      await setLocationType("manual");
      await new Promise((resolve) => setTimeout(resolve, 100));
      await setAddressDetails(addressDetails);

      setIsLoading(false);
      setShowTitleModal(false);
      router.back();
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
      // Ajout de "Abidjan" à la recherche et limitation de la zone
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query + " Abidjan"
        )}&format=json&limit=5&addressdetails=1&accept-language=fr&viewbox=-4.0415,5.3080,-3.9074,5.4161&bounded=1`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'ChickenNation/1.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        // Filtrer les résultats pour ne garder que ceux d'Abidjan
        const abidjanResults = data.filter((result: any) => 
          result.display_name.toLowerCase().includes('abidjan')
        );
        setSearchResults(abidjanResults);
      } catch (parseError) {
        console.error("Erreur de parsing JSON:", text.substring(0, 100));
        throw parseError;
      }
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
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
      console.log("Selected location:", result);
      
      const coordinates = {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      };

      //   on  passer directement les coordonnées
      router.push({
        pathname: "/location",
        params: {
          lat: coordinates.latitude,
          lon: coordinates.longitude,
          address: result.display_name
        }
      });
    } catch (error) {
      console.error("Erreur lors de la sélection de l'adresse:", error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de la sélection de l'adresse",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
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
          <View className="px-6 py-4">
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Rechercher une adresse..."
              className="bg-[#FAFAFA] h-12 rounded-2xl px-4 font-sofia-regular"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Liste des résultats */}
          <ScrollView className="flex-1 px-6">
            {isLoading ? (
              <ActivityIndicator size="large" color="#F17922" className="mt-4" />
            ) : (
              searchResults.map((result) => (
                <TouchableOpacity
                  key={result.place_id}
                  onPress={() => handleSelectLocation(result)}
                  className="flex-row items-center py-4 border-b border-gray-100"
                >
                  <View className="w-8 h-8 mr-3 items-center justify-center">
                    <Image
                      source={require("../../../assets/icons/location.png")}
                      className="w-5 h-5"
                      style={{ resizeMode: "contain" }}
                    />
                  </View>
                  <Text className="flex-1 text-gray-600 font-sofia-regular">
                    {result.display_name}
                  </Text>
                </TouchableOpacity>
              ))
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
