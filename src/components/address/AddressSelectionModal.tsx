import 'react-native-get-random-values';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
  StyleSheet,
  Keyboard,
  Image,
  Platform,
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import { X, MapPin, Search } from "lucide-react-native";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { PROVIDER_GOOGLE, Marker, Region } from 'react-native-maps';
import useLocationStore from '@/store/locationStore';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AddressSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onAddressSelected: () => void;
}

const AddressSelectionModalFinal: React.FC<AddressSelectionModalProps> = ({ 
  visible, 
  onClose, 
  onAddressSelected 
}) => {
  // Refs
  const mapRef = useRef<MapView>(null);
  const googlePlacesRef = useRef(null);
  
  // States
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMovingMarker, setIsMovingMarker] = useState<boolean>(false);
  const [addressText, setAddressText] = useState<string>("");
  const [addressTitle, setAddressTitle] = useState<string>("");
  const [mapReady, setMapReady] = useState<boolean>(false);
  const [searchFocused, setSearchFocused] = useState<boolean>(false);

  // Store
  const { setCoordinates, setAddressDetails, setLocationType } = useLocationStore();

  // Effects
  useEffect(() => {
    if (visible) {
      getCurrentLocation();
      setIsMovingMarker(false);
      setSearchFocused(false);
    }
    
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setSearchFocused(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setTimeout(() => {
          setSearchFocused(false);
        }, 100);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [visible]);

  // Get current location
  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('Permission refusée');
        setIsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      
      const currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setSelectedLocation(currentLocation);
      
      if (mapRef.current && mapReady) {
        mapRef.current.animateToRegion({
          ...currentLocation,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 1000);
      }

      // Reverse geocode to get address details
      await reverseGeocode(currentLocation);
    } catch (error) {
      console.error('Erreur lors de la récupération de la position:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reverse geocode
  const reverseGeocode = async (location: { latitude: number; longitude: number }) => {
    try {
      const [address] = await Location.reverseGeocodeAsync(location);
      
      if (address) {
        const formattedAddress = [
          address.name,
          address.street,
          address.district,
          address.city,
          address.region,
          address.country
        ].filter(Boolean).join(', ');
        
        setAddressText(formattedAddress);
        
        // Suggérer un titre basé sur l'adresse
        if (!addressTitle) {
          if (address.name) {
            setAddressTitle(address.name);
          } else if (address.street) {
            setAddressTitle(address.street.split(' ')[0]);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du géocodage inverse:', error);
    }
  };

  // Handle map press for marker movement
  const handleMapPress = (event: any) => {
    if (!isMovingMarker) return;
    
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
    reverseGeocode(coordinate);
  };

  // Toggle marker movement mode
  const toggleMarkerMovement = () => {
    setIsMovingMarker(!isMovingMarker);
  };

  // Handle location select from search
  const handleLocationSelect = async (data: any, details: any) => {
    if (!details || !details.geometry) return;
    
    const location = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
    };

    setSelectedLocation(location);
    setSearchFocused(false);
    
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        ...location,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }

    try {
      // Récupérer l'adresse à partir des coordonnées avec plus de détails
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&language=fr&key=AIzaSyDL_YVgedC-WgiLBHuYlZ1MA8Rgl470OBY`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        // Prendre le premier résultat qui n'est pas un plus code
        const result = data.results.find((r: any) => 
          !r.formatted_address.match(/\d{2}[A-Z]\d\+[A-Z]{2}\d/)) || data.results[0];
        
        const addressComponents = result.address_components;
        
        // Extraire les composants de l'adresse dans l'ordre hiérarchique
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
        
        const formattedAddress = addressParts.join(', ');

        // Mettre à jour l'adresse affichée
        setAddressText(formattedAddress);

        // Suggérer un titre basé sur le nom du lieu ou l'adresse
        if (details.name && details.name !== formattedAddress) {
          setAddressTitle(details.name);
        } else if (route) {
          setAddressTitle(route);
        }

        // Mettre à jour le store de localisation
        setCoordinates(location);
        setLocationType("manual");
        setAddressDetails({
          formattedAddress: formattedAddress,
          title: addressTitle || "Adresse sélectionnée",
          street: streetAddress,
          city: city,
          neighborhood: district,
          road: route,
          streetNumber: streetNumber
        });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'adresse:', error);
      // En cas d'erreur, utiliser l'adresse formatée de base
      setAddressText(details.formatted_address);
    }
  };

  // Handle confirm location
  const handleConfirmLocation = async () => {
    if (!selectedLocation) return;

    try {
      // Récupérer l'adresse à partir des coordonnées avec plus de détails
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${selectedLocation.latitude},${selectedLocation.longitude}&language=fr&key=AIzaSyDL_YVgedC-WgiLBHuYlZ1MA8Rgl470OBY`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        // Prendre le premier résultat qui n'est pas un plus code
        const result = data.results.find((r: any) => 
          !r.formatted_address.match(/\d{2}[A-Z]\d\+[A-Z]{2}\d/)) || data.results[0];
        
        const addressComponents = result.address_components;
        
        // Extraire les composants de l'adresse dans l'ordre hiérarchique
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
        
        const formattedAddress = addressParts.join(', ');

        // Construction de l'objet adresse complet pour le backend
        const addressObj = {
          title: addressTitle || "Adresse sélectionnée",
          address: formattedAddress,
          street: streetAddress,
          city: city,
          longitude: selectedLocation.longitude,
          latitude: selectedLocation.latitude,
          note: '',
          formattedAddress: formattedAddress,
          addressId: "selected",
          neighborhood: district,
          road: route,
          streetNumber: streetNumber
        };

        // Mettre à jour le store de localisation
        await setCoordinates(selectedLocation);
        await setLocationType("manual");
        await setAddressDetails(addressObj as any);

        // Sauvegarder dans AsyncStorage pour la persistance
        try {
          await AsyncStorage.setItem('userLocation', JSON.stringify({
            type: 'manual',
            coordinates: selectedLocation,
            addressDetails: addressObj
          }));
        } catch (storageError) {
          console.error("Erreur lors de la sauvegarde dans AsyncStorage:", storageError);
        }

        onAddressSelected();
        onClose();
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'adresse:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la récupération de l\'adresse',
        [{ text: 'OK' }]
      );
    }
  };

  // Center map on marker
  const centerMapOnMarker = () => {
    if (!selectedLocation || !mapRef.current) return;
    
    mapRef.current.animateToRegion({
      ...selectedLocation,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 300);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <X size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sélectionner une adresse</Text>
          <View style={styles.headerRight} />
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
              poweredContainer: { display: 'none' },
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

        {/* Map */}
        <View style={styles.mapContainer}>
          {selectedLocation && (
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              onMapReady={() => setMapReady(true)}
              initialRegion={{
                ...selectedLocation,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              onPress={handleMapPress}
            >
              <Marker coordinate={selectedLocation}>
                <Image
                  source={require("../../assets/icons/changelocation.png")}
                  style={{ width: 34, height: 32, resizeMode: "contain" }}
                />
              </Marker>
            </MapView>
          )}

          {/* Move marker button */}
          <TouchableOpacity
            style={[
              styles.moveButton,
              isMovingMarker && styles.moveButtonActive
            ]}
            onPress={toggleMarkerMovement}
          >
            <Text style={styles.moveButtonText}>
              {isMovingMarker ? "Terminer" : "Déplacer le marqueur"}
            </Text>
          </TouchableOpacity>

          {/* Center marker button */}
          <TouchableOpacity
            style={styles.centerButton}
            onPress={centerMapOnMarker}
          >
            <MapPin size={20} color="#FF6B00" />
          </TouchableOpacity>

          {/* Help banner */}
          {isMovingMarker && (
            <View style={styles.helpBanner}>
              <Text style={styles.helpText}>
                Appuyez sur la carte pour déplacer le marqueur
              </Text>
            </View>
          )}
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
       
          <Text style={styles.addressText} numberOfLines={2}>
            {addressText || "Sélectionnez un emplacement sur la carte"}
          </Text>
          
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmLocation}
            disabled={!selectedLocation}
          >
            <Text style={styles.confirmButtonText}>
              Confirmer cette adresse
            </Text>
          </TouchableOpacity>
        </View>

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F17922" />
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRight: {
    width: 40,
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
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
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
  moveButtonActive: {
    backgroundColor: '#333',
  },
  moveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  centerButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  formContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  addressText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  confirmButton: {
    backgroundColor: '#FF6B00',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AddressSelectionModalFinal;
