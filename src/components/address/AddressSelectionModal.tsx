import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Image,
} from "react-native";
import { MapPin, X, Edit2, Check } from "lucide-react-native";
import { getUserAddresses, Address } from "@/services/api/address";
import useLocationStore from "@/store/locationStore";
import GradientButton from "@/components/ui/GradientButton";
import { useRouter } from "expo-router";
import ErrorModal from "@/components/ui/ErrorModal";

interface AddressSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onAddressSelected: () => void;
}

/**
 * Modal permettant à l'utilisateur de sélectionner une adresse parmi celles enregistrées
 */
const AddressSelectionModal: React.FC<AddressSelectionModalProps> = ({
  visible,
  onClose,
  onAddressSelected,
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorModalVisible, setErrorModalVisible] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { setCoordinates, setAddressDetails, setLocationType, setSelectedAddressId } = useLocationStore();
  const router = useRouter();

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
      setErrorMessage("Impossible de charger vos adresses. Veuillez réessayer.");
      setErrorModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Chargement des adresses quand le modal s'ouvre
  useEffect(() => {
    if (visible) {
      loadAddresses();
    }
  }, [visible]);

  /**
   * Sélectionne une adresse et la définit comme adresse active
   */
  const handleSelectAddress = async (address: Address) => {
    try {
      // Mettre à jour le store de localisation
      setCoordinates({
        latitude: address.latitude,
        longitude: address.longitude
      });

      setAddressDetails({
        formattedAddress: address.address,
        title: address.title,
        city: address.city,
        address: address.street || address.address,
        addressId: address.id.toString()
      });
      
      // Enregistrer l'ID de l'adresse sélectionnée
      setSelectedAddressId(address.id.toString());

      setLocationType("manual");

      // Fermer le modal et notifier le parent
      onAddressSelected();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sélection de l'adresse:", error);
      setErrorMessage("Impossible de sélectionner cette adresse. Veuillez réessayer.");
      setErrorModalVisible(true);
    }
  };

  /**
   * Redirige vers l'écran d'édition d'adresse
   */
  const handleEditAddress = (address: Address) => {
    if (!address.id) return;
    
    onClose();
    router.push({
      pathname: "/location/edit-address",
      params: { id: address.id.toString() }
    });
  };

  /**
   * Ajoute une nouvelle adresse
   */
  const handleAddAddress = () => {
    onClose();
    router.push("/location/manualset");
  };

  /**
   * Rendu d'un élément de la liste des adresses
   */
  const renderAddressItem = ({ item }: { item: Address }) => (
    <View className="bg-white rounded-xl p-4 mb-3" style={styles.addressCard}>
      <View className="flex-row items-center">
        <View className="bg-primary-50 p-2 rounded-full mr-3">
        <Image source={require("../../assets/icons/changelocation.png")}
         className="w-12 h-12"
         style={{ resizeMode: "contain" }} />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-sofia-medium text-base">{item.title}</Text>
          <Text className="text-gray-500 font-sofia-regular text-sm" numberOfLines={2}>
            {item.address}
          </Text>
        </View>
      </View>
      
      <View className="flex-row mt-3 pt-3 border-t border-gray-100 justify-between items-center">
        <TouchableOpacity 
          className="flex-row items-center px-3 py-2" 
          onPress={() => handleEditAddress(item)}
        >
          <Edit2 size={16} color="#666" />
          <Text className="text-gray-600 font-sofia-regular ml-1">Modifier</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.selectButton}
          onPress={() => handleSelectAddress(item)}
        >
          <Check size={18} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text className="text-white font-sofia-bold">Choisir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl h-4/5">
            {/* Header du modal */}
            <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
              <Text className="text-lg font-sofia-bold text-gray-800">Choisir une adresse</Text>
              <TouchableOpacity onPress={onClose} className="p-2">
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Contenu du modal */}
            <View className="flex-1 px-4 pt-4">
              {isLoading ? (
                <View className="flex-1 justify-center items-center">
                  <ActivityIndicator size="large" color="#FF6B00" />
                </View>
              ) : addresses.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                  <Image
                    source={require("../../assets/icons/changelocation.png")}
                    className="w-16 h-16 sm:w-20 sm:h-20"
                    style={{ resizeMode: "contain" }}
                  />
                  <Text className="text-gray-500 font-sofia-medium text-base mt-4 mb-8 text-center px-4">
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
                      <Text className="text-white text-lg font-urbanist-medium">Ajouter une adresse</Text>
                    </GradientButton>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal d'erreur */}
      <ErrorModal 
        visible={errorModalVisible}
        message={errorMessage}
        onClose={() => setErrorModalVisible(false)}
      />
    </>
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
  selectButton: {
    backgroundColor: "#FF6B00",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#FF6B00",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  }
});

export default AddressSelectionModal;
