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
import { MapPin, Plus, Trash2 } from "lucide-react-native";
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
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
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
  const handleDeleteAddress = async (addressId: number) => {
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

  /**
   * Ajoute une nouvelle adresse
   */
  const handleAddAddress = () => {
    router.push("/location/manualset");
  };

  /**
   * Rendu d'un élément de la liste des adresses
   */
  const renderAddressItem = ({ item }: { item: Address }) => (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-3 flex-row items-center"
      style={styles.addressCard}
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
      <TouchableOpacity
        className="p-2"
        onPress={() => item.id && handleDeleteAddress(item.id)}
      >
        <Trash2 size={18} color="#FF3B30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <DynamicHeader
        displayType="back-with-title"
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
              text="Ajouter une adresse"
              onPress={handleAddAddress}
              width={250}
            />
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
                text="Ajouter une adresse"
                onPress={handleAddAddress}
                icon={<Plus size={20} color="#FFFFFF" />}
              />
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
