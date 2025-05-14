import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { getAllRestaurants } from '@/services/restaurantService';
import useOrderStore from '@/store/orderStore';

interface RestaurantSelectorProps {
  visible: boolean;
  onClose: () => void;
}

const RestaurantSelector: React.FC<RestaurantSelectorProps> = ({ visible, onClose }) => {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectedRestaurantId, setSelectedRestaurantId } = useOrderStore();

  useEffect(() => {
    if (visible) {
      setLoading(true);
      getAllRestaurants(1, 20)
        .then(setRestaurants)
        .finally(() => setLoading(false));
    }
  }, [visible]);

  const handleSelect = (id: string) => {
    setSelectedRestaurantId(id);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Choisir un restaurant</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#FF6B00" />
          ) : (
            <FlatList
              data={restaurants}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.item, selectedRestaurantId === item.id && styles.selectedItem]}
                  onPress={() => handleSelect(item.id)}
                >
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.address}>{item.address}</Text>
                  <Text style={[styles.status, { color: item.isOpen ? '#22c55e' : '#ef4444' }]}> 
                    {item.isOpen ? 'Ouvert' : 'Fermé'}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888' }}>Aucun restaurant trouvé</Text>}
            />
          )}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  item: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#F3F4F6',
  },
  selectedItem: {
    backgroundColor: '#FFEDD5',
    borderColor: '#FF6B00',
    borderWidth: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  address: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  status: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 16,
    alignSelf: 'center',
    backgroundColor: '#FF6B00',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default RestaurantSelector; 