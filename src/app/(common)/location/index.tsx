import React, { useRef, useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Alert,
  Text,
  StyleSheet,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker, Region } from "react-native-maps";
import * as ExpoLocation from "expo-location";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import LocationBottomSheet from "@/components/ui/LocationBottomSheet";
import CustomStatusBar from "@/components/ui/CustomStatusBar"; 
import useLocationStore from "@/store/locationStore";
import { useRouter, useLocalSearchParams } from "expo-router";
import Spinner from "@/components/ui/Spinner"; 
import { addUserAddress, Address } from "@/services/api/address";
import { useAuth } from "@/app/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Search, MapPin } from "lucide-react-native";

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
  const googlePlacesRef = useRef(null);
  const {
    coordinates,
    setCoordinates,
    setLocationType,
    setAddressDetails,
    clearLocationData,
  } = useLocationStore();
  const params = useLocalSearchParams();
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(
    coordinates
  );
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [showTitleModal, setShowTitleModal] = useState<boolean>(false);
  const [addressTitle, setAddressTitle] = useState<string>("");
  const [tempLocationData, setTempLocationData] = useState<any>(null);
  const [isMovingMarker, setIsMovingMarker] = useState<boolean>(false);
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  const router = useRouter();

  // Mise à jour de la carte quand les coordonnées changent dans le store
  useEffect(() => {
    if (coordinates) {
      setCurrentLocation(coordinates);
      centerOnLocation(
        coordinates.latitude,
        coordinates.longitude
      );
    }
  }, [coordinates]);

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
  const handleMarkerDragEnd = async (event: {
    nativeEvent: { coordinate: Coordinates };
  }): Promise<void> => {
    const newLocation = event.nativeEvent.coordinate;
    setCurrentLocation(newLocation);

    try {
      // Récupérer l'adresse à partir des nouvelles coordonnées
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${newLocation.latitude},${newLocation.longitude}&language=fr&key=AIzaSyDL_YVgedC-WgiLBHuYlZ1MA8Rgl470OBY`
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
        const neighborhood = addressComponents?.find((component: any) => 
          component.types.includes('neighborhood'))?.long_name || '';
        const sublocality = addressComponents?.find((component: any) => 
          component.types.includes('sublocality'))?.long_name || '';
        const city = addressComponents?.find((component: any) => 
          component.types.includes('locality'))?.long_name || 'Abidjan';
        
        // Construire l'adresse de manière hiérarchique
        const streetAddress = `${streetNumber} ${route}`.trim();
        const district = neighborhood || sublocality;
        
        // Construire l'adresse complète
        const addressParts = [];
        if (streetAddress) addressParts.push(streetAddress);
        if (district) addressParts.push(district);
        if (city) addressParts.push(city);
        
        const formattedAddress = addressParts.join(', ') || result.formatted_address;

        // Préparer les données d'adresse
        const addressData = {
          formattedAddress: formattedAddress,
          title: "Adresse sélectionnée",
          street: streetAddress || route,
          city: city,
          neighborhood: district,
          road: route,
          streetNumber: streetNumber
        };

        // Mettre à jour le store de localisation
        setCoordinates(newLocation);
        setLocationType("manual");
        setAddressDetails(addressData);

        // Sauvegarder dans AsyncStorage
        try {
          await AsyncStorage.setItem('userLocation', JSON.stringify({
            type: 'manual',
            coordinates: newLocation,
            addressDetails: addressData
          }));
          console.log('Adresse mise à jour avec succès dans AsyncStorage');
        } catch (storageError) {
          console.error("Erreur lors de la sauvegarde dans AsyncStorage:", storageError);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'adresse:', error);
    }
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
  const handleUseCurrentLocation = async () => {
    try {
      setIsLocating(true);

      // Utiliser la position du marqueur au lieu de la position en temps réel
      if (!currentLocation) {
        Alert.alert(
          'Erreur',
          'Veuillez d\'abord placer le marqueur sur la carte',
          [{ text: 'OK' }]
        );
        return;
      }

      // Récupérer l'adresse à partir des coordonnées du marqueur
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${currentLocation.latitude},${currentLocation.longitude}&language=fr&key=AIzaSyDL_YVgedC-WgiLBHuYlZ1MA8Rgl470OBY`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        
        // Utiliser directement les données de l'API
        const addressData = {
          formattedAddress: result.formatted_address,
          title: result.formatted_address,
          street: result.address_components?.find((component: any) => 
            component.types.includes('route'))?.long_name || "",
          city: result.address_components?.find((component: any) => 
            component.types.includes('locality'))?.long_name || "Abidjan",
          neighborhood: result.address_components?.find((component: any) => 
            component.types.includes('neighborhood'))?.long_name || "",
          road: result.address_components?.find((component: any) => 
            component.types.includes('route'))?.long_name || "",
          streetNumber: result.address_components?.find((component: any) => 
            component.types.includes('street_number'))?.long_name || ""
        };

        console.log("Adresse récupérée:", addressData);

        // D'abord, effacer les données existantes
        clearLocationData();

        // Ensuite, mettre à jour le store de localisation
        setCoordinates(currentLocation);
        setLocationType("manual");
        setAddressDetails(addressData);

        // Sauvegarder dans AsyncStorage pour la persistance
        try {
          await AsyncStorage.setItem('userLocation', JSON.stringify({
            type: 'manual',
            coordinates: currentLocation,
            addressDetails: addressData
          }));
          console.log('Adresse sauvegardée avec succès dans AsyncStorage:', addressData);
        } catch (storageError) {
          console.error("Erreur lors de la sauvegarde dans AsyncStorage:", storageError);
        }

        router.back();
      } else {
        throw new Error('Impossible de récupérer l\'adresse');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'adresse:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la récupération de l\'adresse',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLocating(false);
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

  // Handle location select from search
  const handleLocationSelect = async (data: any, details: any) => {
    if (!details || !details.geometry) return;
    
    const location = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
    };

    // Mettre à jour la position du marqueur
    setCurrentLocation(location);
    setSearchFocused(false);
    
    // Animer la carte vers la nouvelle position
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        ...location,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }

    try {
      // Utiliser directement les données de l'API Google Places
      const addressData = {
        formattedAddress: details.formatted_address || data.description,
        title: details.name || data.description,
        street: details.address_components?.find((component: any) => 
          component.types.includes('route'))?.long_name || "",
        city: details.address_components?.find((component: any) => 
          component.types.includes('locality'))?.long_name || "Abidjan",
        neighborhood: details.address_components?.find((component: any) => 
          component.types.includes('neighborhood'))?.long_name || "",
        road: details.address_components?.find((component: any) => 
          component.types.includes('route'))?.long_name || "",
        streetNumber: details.address_components?.find((component: any) => 
          component.types.includes('street_number'))?.long_name || ""
      };

      console.log("Adresse sélectionnée:", addressData);

      // D'abord, effacer les données existantes
      clearLocationData();

      // Ensuite, mettre à jour le store de localisation
      setCoordinates(location);
      setLocationType("manual");
      setAddressDetails(addressData);

      // Sauvegarder dans AsyncStorage pour la persistance
      try {
        await AsyncStorage.setItem('userLocation', JSON.stringify({
          type: 'manual',
          coordinates: location,
          addressDetails: addressData
        }));
        console.log('Adresse sauvegardée avec succès dans AsyncStorage:', addressData);
      } catch (storageError) {
        console.error("Erreur lors de la sauvegarde dans AsyncStorage:", storageError);
      }

      router.back();
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'adresse:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la récupération de l\'adresse',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <CustomStatusBar />
        <View className="px-3 mb-3">
          <View className="flex flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <Image source={require("../../../assets/icons/arrow-back.png")} style={{ width: 30, height: 30, }} />
            </TouchableOpacity>
            <Text className="text-2xl font-sofia-medium">Localisation</Text>
            <View />
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <GooglePlacesAutocomplete
            ref={googlePlacesRef}
            placeholder="Rechercher une adresse..."
            onPress={handleLocationSelect}
            textInputProps={{
              onFocus: () => setSearchFocused(true),
              onBlur: () => setSearchFocused(false),
            }}
            query={{
              key: 'AIzaSyDL_YVgedC-WgiLBHuYlZ1MA8Rgl470OBY',
              language: 'fr',
              components: 'country:ci',
            }}
            styles={{
              container: styles.placesContainer,
              textInputContainer: styles.placesInputContainer,
              textInput: styles.placesInput,
              listView: styles.placesList,
              row: styles.placesRow,
              description: styles.placesDescription,
              separator: styles.placesSeparator,
              poweredContainer: { display: 'none' }
            }}
            enablePoweredByContainer={false}
            fetchDetails={true}
            onFail={error => console.error(error)}
            renderLeftButton={() => (
              <View style={styles.searchIconContainer}>
                <Search size={18} color="#666" />
              </View>
            )}
            renderRow={(data) => (
              <View style={styles.searchResultRow}>
                <View style={styles.searchResultIcon}>
                  <MapPin size={16} color="#666" />
                </View>
                <View style={styles.searchResultTextContainer}>
                  <Text style={styles.searchResultMainText}>
                    {data.structured_formatting?.main_text || data.description}
                  </Text>
                  <Text style={styles.searchResultSecondaryText}>
                    {data.structured_formatting?.secondary_text || ''}
                  </Text>
                </View>
              </View>
            )}
            listViewDisplayed={searchFocused}
            keyboardShouldPersistTaps="handled"
          />
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
                  source={require("../../../assets/icons/changelocation.png")}
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 10,
  },
  placesContainer: {
    flex: 0,
  },
  placesInputContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 0,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  placesInput: {
    height: 44,
    backgroundColor: 'transparent',
    fontSize: 16,
    color: '#1F2937',
    padding: 0,
    marginLeft: 8,
  },
  placesList: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: 200,
  },
  placesRow: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  placesDescription: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '400',
  },
  placesSeparator: {
    height: 0,
  },
  searchIconContainer: {
    padding: 8,
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  searchResultIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchResultTextContainer: {
    flex: 1,
  },
  searchResultMainText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  searchResultSecondaryText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default Location;
