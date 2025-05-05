import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import GradientButton from "@/components/ui/GradientButton";
import DynamicHeader from "@/components/home/DynamicHeader";
import { getUserAddresses, updateUserAddress, Address } from "@/services/api/address";
import SuccessModal from "@/components/ui/SuccessModal";
import MapView, { PROVIDER_GOOGLE, Marker, Region } from "react-native-maps";
import { MapPin } from "lucide-react-native";
import Cart from "../cart";
import CustomStatusBar from "@/components/ui/CustomStatusBar";

// Région par défaut centrée sur Abidjan
const ABIDJAN_REGION: Region = {
  latitude: 5.3599517,
  longitude: -4.0082563,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

/**
 * Écran pour éditer une adresse existante
 */
const EditAddress: React.FC = () => {
  const [address, setAddress] = useState<Address | null>(null);
  const [title, setTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [isMovingMarker, setIsMovingMarker] = useState<boolean>(false);
  const mapRef = useRef<MapView>(null);
  
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Charger les données de l'adresse
  useEffect(() => {
    const loadAddress = async () => {
      // Récupérer l'ID depuis les paramètres
      const id = params.id as string;
      console.log("ID récupéré des paramètres:", id, "Type:", typeof id);
      
      if (!id) {
        Alert.alert("Erreur", "ID d'adresse invalide");
        router.back();
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Vérifier si nous avons des données directement dans les paramètres
        const paramTitle = params.title as string;
        const paramAddress = params.address as string;
        const paramLatitude = params.latitude ? parseFloat(params.latitude as string) : null;
        const paramLongitude = params.longitude ? parseFloat(params.longitude as string) : null;
        
        // Si nous avons toutes les données nécessaires dans les paramètres
        if (paramTitle && paramAddress && paramLatitude !== null && paramLongitude !== null) {
          setAddress({
            id: id, // Garder l'ID comme une chaîne
            title: paramTitle,
            address: paramAddress,
            street: "",
            city: "",
            latitude: paramLatitude,
            longitude: paramLongitude
          });
          setTitle(paramTitle);
          setCurrentLocation({
            latitude: paramLatitude,
            longitude: paramLongitude
          });
          setIsLoading(false);
          return;
        }
        
        // Sinon, récupérer l'adresse depuis l'API
        const addresses = await getUserAddresses();
        console.log("Adresses récupérées:", JSON.stringify(addresses, null, 2));
        console.log("ID recherché:", id, "Type:", typeof id);
        
        // Comparer les ID en tant que chaînes de caractères pour éviter les problèmes de type
        const foundAddress = addresses.find(a => {
          console.log("Comparaison:", a.id, typeof a.id, "avec", id, typeof id);
          return String(a.id) === String(id);
        });
        
        if (!foundAddress) {
          Alert.alert("Erreur", "Adresse non trouvée");
          router.back();
          return;
        }
        
        console.log("Adresse trouvée:", JSON.stringify(foundAddress, null, 2));
        setAddress(foundAddress);
        setTitle(foundAddress.title || "");
        setCurrentLocation({
          latitude: foundAddress.latitude,
          longitude: foundAddress.longitude
        });
      } catch (error) {
        console.error("Erreur lors du chargement de l'adresse:", error);
        Alert.alert("Erreur", "Impossible de charger les données de l'adresse");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAddress();
  }, [params.id]); // Ne dépendre que de l'ID de l'adresse, pas de tous les paramètres
  
  /**
   * Mise à jour de la position du marqueur
   */
  const handleMapPress = (event: any) => {
    // Mettre à jour la position du marqueur lorsque l'utilisateur appuie sur la carte
    if (!isMovingMarker) return;
    
    const { coordinate } = event.nativeEvent;
    setCurrentLocation(coordinate);
    console.log("Nouvelle position du marqueur:", coordinate);
  };
  
  /**
   * Activer/désactiver le mode de déplacement du marqueur
   */
  const toggleMarkerMovement = () => {
    setIsMovingMarker(!isMovingMarker);
  };
  
  /**
   * Permet à l'utilisateur de centrer la carte sur le marqueur actuel
   */
  const centerMapOnMarker = () => {
    if (!currentLocation || !mapRef.current) return;
    
    mapRef.current.animateToRegion({
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 300);
  };
  
 
  const handleRegionChange = (region: Region) => {
    
  };
  
  
  const handleSaveAddress = async (): Promise<void> => {
    if (!address || !currentLocation) {
      Alert.alert("Erreur", "Données d'adresse incomplètes");
      return;
    }
    
    if (!title.trim()) {
      Alert.alert("Champ obligatoire", "Veuillez renseigner un titre pour l'adresse");
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Préparer les données pour la mise à jour
      const addressData: Partial<Address> = {
        title: title,
        // Conserver l'adresse d'origine
        address: address.address,
        street: address.street,
        city: address.city,
        // Mettre à jour les coordonnées
        longitude: currentLocation.longitude,
        latitude: currentLocation.latitude,
      };
      
      console.log("ID de l'adresse pour la mise à jour:", address.id, "Type:", typeof address.id);
      
      // Mettre à jour l'adresse
      const updatedAddress = await updateUserAddress(address.id, addressData);
      
      if (updatedAddress) {
        setShowSuccessModal(true);
      } else {
        throw new Error("Échec de la mise à jour de l'adresse");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'adresse:", error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de la mise à jour de l'adresse",
        [{ text: "OK" }],
      );
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleModalClose = (): void => {
    setShowSuccessModal(false);
    router.back();
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <StatusBar style="dark" />
      <CustomStatusBar />
      <View className="px-3  mb-3">
       <View className="flex flex-row items-center justify-between">
      <TouchableOpacity onPress={() => router.back()}>
        <Image source={require("../../../assets/icons/arrow-back.png")} style={{ width: 30, height: 30, }} />
        </TouchableOpacity>
        <Text className="text-2xl font-sofia-medium">Modifier l'adresse</Text>
        <View />
 
        </View>
       </View>
      
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#F17922" />
        </View>
      ) : (
        <View className="flex-1 bg-white">
          {/* Carte pour sélectionner la position */}
          <View className="flex-1 relative">
            {currentLocation && (
              <>
                <MapView
                  ref={mapRef}
                  provider={PROVIDER_GOOGLE}
                  style={{ flex: 1 }}
                  initialRegion={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  onPress={handleMapPress}
                >
                  <Marker
                    coordinate={currentLocation}
                  >
                    <Image
                      source={require("../../../assets/icons/location.png")}
                      style={{ width: 34, height: 32, resizeMode: "contain" }}
                    />
                  </Marker>
                </MapView>
                
                {/* Bouton pour activer/désactiver le mode de déplacement */}
                <TouchableOpacity
                  style={styles.moveButton}
                  onPress={toggleMarkerMovement}
                >
                  <Text style={styles.moveButtonText}>
                    {isMovingMarker ? "Terminer" : "Déplacer le marqueur"}
                  </Text>
                </TouchableOpacity>
                
                {/* Message d'aide pour le déplacement */}
                {isMovingMarker && (
                  <View style={styles.helpBanner}>
                    <Text style={styles.helpText}>
                      Appuyez sur la carte pour déplacer le marqueur
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
          
          {/* Formulaire de titre */}
          <View className="p-4 bg-white">
            <Text className="text-gray-700 font-sofia-medium mb-2">Nom de l'adresse</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: Maison, Bureau, etc."
              className="border border-gray-200 rounded-xl p-4 mb-4"
            />
            
            <Text className="text-gray-500 font-sofia-regular mb-4 text-sm">
              Déplacez le marqueur sur la carte pour ajuster la position de l'adresse.
            </Text>
            
            <GradientButton
              onPress={handleSaveAddress}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white text-lg font-urbanist-medium">Enregistrer les modifications</Text>
              )}
            </GradientButton>
          </View>
        </View>
      )}
      
      {/* Modal de succès */}
      <SuccessModal
        visible={showSuccessModal}
        message="Votre adresse a été modifiée avec succès."
        onClose={handleModalClose}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  moveButton: {
    position: 'absolute',
    bottom: 16,
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

export default EditAddress;
