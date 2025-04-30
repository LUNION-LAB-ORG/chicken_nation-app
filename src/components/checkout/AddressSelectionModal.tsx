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
import { MapPin, Plus, X } from 'lucide-react-native';
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
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-5 h-3/4">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-sofia-bold text-gray-900">Sélectionner une adresse</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Contenu */}
          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#FF6B00" />
            </View>
          ) : addresses.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <MapPin size={48} color="#CCCCCC" />
              <Text className="text-gray-500 font-sofia-medium text-base mt-4 mb-8 text-center">
                Vous n'avez pas encore d'adresses enregistrées
              </Text>
              <GradientButton
                onPress={handleAddAddress}
                style={{ width: 250 }}
              >
                <View className="flex-row items-center">
                  <Plus size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text className="text-white font-sofia-medium">Ajouter une adresse</Text>
                </View>
              </GradientButton>
            </View>
          ) : (
            <FlatList
              data={addresses}
              renderItem={renderAddressItem}
              keyExtractor={(item) => `address-${item.id}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          )}

          {/* Bouton d'ajout d'adresse */}
          {addresses.length > 0 && (
            <View className="mt-4">
              <GradientButton
                onPress={handleAddAddress}
              >
                <View className="flex-row items-center">
                  <Plus size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text className="text-white font-sofia-medium">Ajouter une nouvelle adresse</Text>
                </View>
              </GradientButton>
            </View>
          )}
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
