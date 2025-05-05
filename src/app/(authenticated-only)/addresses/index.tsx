import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MapPin, Plus, Trash2, Edit2 } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DynamicHeader from "@/components/home/DynamicHeader";
import { getUserAddresses, deleteUserAddress, Address } from "@/services/api/address";
import { useLocation } from "@/app/context/LocationContext";
import GradientButton from "@/components/ui/GradientButton";

/**
 * Écran de gestion des adresses de l'utilisateur
 */
const AddressesScreen: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | number | null>(null);
  const router = useRouter();
  const { setAddressDetails, setCoordinates, setLocationType } = useLocation();

  /**
   * Charge les adresses de l'utilisateur depuis le backend
   */
  const loadAddresses = async () => {
    setIsLoading(true);
    try {
      const userAddresses = await getUserAddresses();
      setAddresses(userAddresses);
    } catch (error) {
      console.error("Erreur lors du chargement des adresses:", error);
      Alert.alert(
        "Erreur",
        "Impossible de charger vos adresses. Veuillez réessayer."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Chargement initial des adresses
  useEffect(() => {
    loadAddresses();
  }, []);

  /**
   * Sélectionne une adresse et la définit comme adresse active
   */
  const handleSelectAddress = async (address: Address) => {
    try {
      setSelectedAddressId(address.id || null);

      // Mettre à jour le contexte de localisation
      await setCoordinates({
        latitude: address.latitude,
        longitude: address.longitude
      });

      await setAddressDetails({
        formattedAddress: address.address,
        title: address.title,
        city: address.city,
        address: address.street
      });

      await setLocationType("manual");

      // Retourner à l'écran précédent
      router.back();
    } catch (error) {
      console.error("Erreur lors de la sélection de l'adresse:", error);
      Alert.alert(
        "Erreur",
        "Impossible de sélectionner cette adresse. Veuillez réessayer."
      );
    }
  };

  /**
   * Supprime une adresse
   */
  const handleDeleteAddress = async (addressId: string | number) => {
    Alert.alert(
      "Supprimer l'adresse",
      "Êtes-vous sûr de vouloir supprimer cette adresse ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              const success = await deleteUserAddress(addressId);
              if (success) {
                // Recharger les adresses après la suppression
                await loadAddresses();
              } else {
                throw new Error("Échec de la suppression");
              }
            } catch (error) {
              console.error("Erreur lors de la suppression de l'adresse:", error);
              Alert.alert(
                "Erreur",
                "Impossible de supprimer cette adresse. Veuillez réessayer."
              );
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

 
  const handleAddAddress = () => {
    router.push("/location/manualset");
  };

 
  const handleEditAddress = (address: Address) => {
    if (!address.id) return;
    
    router.push({
      pathname: "/location/edit-address",
      params: { id: address.id.toString() }
    });
  };

  /**
   * Rendu d'un élément de la liste des adresses
   */
  const renderAddressItem = ({ item }: { item: Address }) => (
    <View
      className="bg-white rounded-xl p-4 mb-3"
      style={styles.addressCard}
    >
      <TouchableOpacity
        className="flex-row items-center"
        onPress={() => handleSelectAddress(item)}
      >
        <View className="bg-primary-50 p-2 rounded-full mr-3">
          <MapPin size={20} color="#FF6B00" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-sofia-medium text-base">{item.title}</Text>
          <Text className="text-gray-500 font-sofia-regular text-sm" numberOfLines={2}>
            {item.address}
          </Text>
        </View>
      </TouchableOpacity>
      
      <View className="flex-row mt-3 pt-3 border-t border-gray-100 justify-end">
        <TouchableOpacity 
          className="mr-4 flex-row items-center" 
          onPress={() => handleEditAddress(item)}
        >
          <Edit2 size={16} color="#666" />
          <Text className="text-gray-600 font-sofia-regular ml-1">Modifier</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-row items-center" 
          onPress={() => handleDeleteAddress(item.id as string | number)}
        >
          <Trash2 size={16} color="#FF3B30" />
          <Text className="text-red-500 font-sofia-regular ml-1">Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <DynamicHeader
        displayType="back"
        title="Mes adresses"
        showCart={true}
      />

      <View className="flex-1 px-4 pt-4">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#FF6B00" />
          </View>
        ) : addresses.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <MapPin size={48} color="#CCCCCC" />
            <Text className="text-gray-500 font-sofia-medium text-base mt-4 mb-8">
              Vous n'avez pas encore d'adresses enregistrées
            </Text>
            <GradientButton
              onPress={handleAddAddress}
            >
              <Text className="text-white text-lg font-urbanist-medium">Ajouter une adresse</Text>
            </GradientButton>
          </View>
        ) : (
          <>
            <FlatList
              data={addresses}
              renderItem={renderAddressItem}
              keyExtractor={(item) => `address-${item.id}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
            
            <View className="absolute bottom-8 right-4 left-4">
              <GradientButton
                onPress={handleAddAddress}
              >
                <View className="flex-row items-center">
                  <Plus size={20} color="#FFFFFF" />
                  <Text className="text-white text-lg font-urbanist-medium ml-2">Ajouter une adresse</Text>
                </View>
              </GradientButton>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  addressCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});

export default AddressesScreen;
