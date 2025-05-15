import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert, Linking } from 'react-native';

interface LocationPermissionState {
  isLocationEnabled: boolean;
  permissionStatus: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useLocationPermissions = () => {
  const [state, setState] = useState<LocationPermissionState>({
    isLocationEnabled: false,
    permissionStatus: null,
    isLoading: true,
    error: null,
  });

  const checkLocationPermissions = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Vérifier si la localisation est activée
      const locationEnabled = await Location.hasServicesEnabledAsync();
      setState(prev => ({ ...prev, isLocationEnabled: locationEnabled }));

      if (!locationEnabled) {
        setState(prev => ({
          ...prev,
          error: 'La localisation est désactivée sur votre appareil.',
        }));
        return false;
      }

      // Vérifier les permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      setState(prev => ({ ...prev, permissionStatus: status }));

      if (status !== 'granted') {
        setState(prev => ({
          ...prev,
          error: 'L\'accès à votre position est nécessaire.',
        }));
        return false;
      }

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Une erreur est survenue lors de la vérification des permissions.',
      }));
      return false;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const requestLocationPermission = async () => {
    const hasPermission = await checkLocationPermissions();
    
    if (!hasPermission) {
      Alert.alert(
        "Permission requise",
        "L'accès à votre position est nécessaire pour utiliser cette fonctionnalité.",
        [
          { text: "Annuler", style: "cancel" },
          { 
            text: "Paramètres", 
            onPress: () => Linking.openSettings() 
          }
        ]
      );
    }
    
    return hasPermission;
  };

  // Vérifier les permissions au montage du composant
  useEffect(() => {
    checkLocationPermissions();
  }, []);

  return {
    ...state,
    checkLocationPermissions,
    requestLocationPermission,
  };
}; 