import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { MapPin, Plus, X, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { getUserAddresses, Address } from '@/services/api/address';
import { useLocation } from '@/app/context/LocationContext';
import GradientButton from '@/components/ui/GradientButton';

interface AddressSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectAddress: (address: Address) => void;
}

const AddressSelectionModal: React.FC<AddressSelectionModalProps> = ({
  visible,
  onClose,
  onSelectAddress,
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Charger les adresses au montage du composant
  useEffect(() => {
    if (visible) {
      loadAddresses();
    }
  }, [visible]);

  // Fonction pour charger les adresses de l'utilisateur
  const loadAddresses = async () => {
    setIsLoading(true);
    try {
      const userAddresses = await getUserAddresses();
      setAddresses(userAddresses);
    } catch (error) {
      console.error('Erreur lors du chargement des adresses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour ajouter une nouvelle adresse
  const handleAddAddress = () => {
    onClose(); // Fermer d'abord le modal
    router.push('/location/manualset');
  };

  // Fonction pour sélectionner une adresse
  const handleSelectAddress = (address: Address) => {
    onSelectAddress(address);
    onClose();
  };

  // Rendu d'un élément de la liste des adresses
  const renderAddressItem = ({ item }: { item: Address }) => (
    <View className="bg-white rounded-xl p-4 mb-3" style={styles.addressCard}>
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
          className="flex-row items-center bg-primary-500 px-4 py-2 rounded-full" 
          onPress={() => handleSelectAddress(item)}
        >
          <Check size={16} color="#FFFFFF" />
          <Text className="text-white font-sofia-medium ml-1">Choisir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
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
                <MapPin size={48} color="#CCCCCC" />
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
  );
};

const styles = StyleSheet.create({
  addressCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});

export default AddressSelectionModal;
