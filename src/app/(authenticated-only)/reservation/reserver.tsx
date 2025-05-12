import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import GradientButton from "@/components/ui/GradientButton";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import { StatusBar } from "expo-status-bar";
import DynamicHeader from "@/components/home/DynamicHeader";
import useOrderTypeStore, { OrderType, DBTableType } from "@/store/orderTypeStore";
import TimePicker from "@/components/reservation/TimePickerProps";
import CalendarPicker from "@/components/reservation/CalendarPicker";
import TableReservation from "@/components/reservation/TableReservation";
import { useAuth } from "@/app/context/AuthContext";
import { getCustomerDetails } from "@/services/api/customer";
import AsyncStorage from '@react-native-async-storage/async-storage';
import RestaurantSelector from '@/components/checkout/RestaurantSelector';
import useOrderStore from '@/store/orderStore';
import { getRestaurantById } from '@/services/restaurantService';

const Reserver = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [date, setDate] = useState(new Date());
  const [numberOfGuests, setNumberOfGuests] = useState(4);
  const [tableType, setTableType] = useState(DBTableType.TABLE_ROUND);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // États pour le formulaire de l'étape 2
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  // États pour la sélection de l'heure
  const [selectedHour, setSelectedHour] = useState("11");
  const [selectedMinute, setSelectedMinute] = useState("30");

  // Utiliser le nouveau store centralisé
  const { setActiveType, setReservationData } = useOrderTypeStore();

  const { selectedRestaurantId } = useOrderStore();
  const [showRestaurantSelector, setShowRestaurantSelector] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);

  // Récupérer les données de l'utilisateur et remplir les champs automatiquement
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // Si nous avons déjà les données de base de l'utilisateur
        if (user) {
          // Pré-remplir le nom complet si disponible
          if (user.first_name && user.last_name) {
            setFullName(`${user.first_name} ${user.last_name}`);
          }
          
          // Pré-remplir l'email si disponible
          if (user.email) {
            setEmail(user.email);
          }
          
          // Pré-remplir le numéro de téléphone si disponible
          if (user.phone) {
            // Formatter le numéro de téléphone pour l'affichage (sans le préfixe international)
            const formattedPhone = user.phone.replace(/^\+?225/, "");
            setPhoneNumber(formattedPhone);
          }
          
          // Si nous avons besoin de données plus détaillées, nous pouvons appeler l'API
          const userDetails = await getCustomerDetails();
          
          // Mettre à jour les champs avec les données détaillées si disponibles
          if (userDetails) {
            if (!fullName && userDetails.first_name && userDetails.last_name) {
              setFullName(`${userDetails.first_name} ${userDetails.last_name}`);
            }
            
            if (!email && userDetails.email) {
              setEmail(userDetails.email);
            }
            
            if (!phoneNumber && userDetails.phone) {
              const formattedPhone = userDetails.phone.replace(/^\+?225/, "");
              setPhoneNumber(formattedPhone);
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données utilisateur:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [user]);

  useEffect(() => {
    if (selectedRestaurantId) {
      getRestaurantById(selectedRestaurantId).then(setSelectedRestaurant);
    } else {
      setSelectedRestaurant(null);
    }
  }, [selectedRestaurantId]);

  const handleGuestChange = (increment) => {
    setNumberOfGuests((prev) => Math.max(1, prev + increment));
  };

  const handleTableTypeChange = (type) => {
    setTableType(type);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Vérifier si un restaurant est sélectionné
      if (!selectedRestaurant) {
        alert("Veuillez sélectionner un restaurant pour votre réservation.");
        return;
      }

      // Activer le type de commande TABLE dans le store centralisé
      setActiveType(OrderType.TABLE);
      setCurrentStep(2);

      // Mettre à jour l'objet date avec l'heure sélectionnée
      const newDate = new Date(date);
      newDate.setHours(parseInt(selectedHour));
      newDate.setMinutes(parseInt(selectedMinute));
      setDate(newDate);

      // Construction de l'objet adresse au même format que AddressSelectionModal
      const addressObj = {
        title: selectedRestaurant.name,
        address: selectedRestaurant.address,
        street: selectedRestaurant.address.split(',')[0] || '',
        city: selectedRestaurant.address.split(',')[1]?.trim() || '',
        longitude: selectedRestaurant.longitude || 0,
        latitude: selectedRestaurant.latitude || 0,
        note: '',
        formattedAddress: selectedRestaurant.address,
        addressId: "restaurant"
      };

      // Mettre à jour les données de réservation dans le store centralisé
      const reservationData = {
        date: newDate,
        time: `${selectedHour}:${selectedMinute}`,
        numberOfPeople: numberOfGuests,
        tableType,
        restaurant: {
          id: selectedRestaurant.id,
          name: selectedRestaurant.name,
          address: selectedRestaurant.address
        },
        // Utiliser le même format d'adresse que AddressSelectionModal
        address: addressObj
      };
      
      setReservationData(reservationData);
      
    } else {
      // Valider les champs obligatoires
      if (!fullName.trim()) {
        alert("Veuillez renseigner votre nom complet.");
        return;
      }
      
      if (!phoneNumber.trim()) {
        alert("Veuillez renseigner votre numéro de téléphone.");
        return;
      }
      
      if (!email.trim()) {
        alert("Veuillez renseigner votre adresse email.");
        return;
      }

      // Mettre à jour les données complètes dans le store centralisé
      const reservationData = {
        fullName,
        phoneNumber,
        email,
        notes,
        date,
        time: `${selectedHour}:${selectedMinute}`,
        numberOfPeople: numberOfGuests,
        tableType, // Utiliser le type de table au format de la base de données
      };
      
      setReservationData(reservationData);
      
    
      // Rediriger vers le menu
      router.push("/(tabs-user)/menu");
    }
  };

  /**
   * Gère l'annulation et le retour
   */
  const handleCancel = () => {
    if (currentStep === 2) {
      // Revenir à l'étape 1
      setCurrentStep(1);
    } else {
      // Annuler complètement la réservation
      router.back();
    }
  };

  // Rendu de l'étape 1: Choix de la date, heure, nombre d'invités et type de table
  const renderStep1 = () => (
    <View className="px-6 mt-6">
      <View className="flex flex-row gap-4 mb-6">
        <Image
          source={require("../../../assets/icons/chicken.png")}
          style={{ width: 18, height: 18, resizeMode: "contain" }}
        />
        <Text className="text-md font-sofia-bold text-orange-500 mb-4">
          Date et heure de réservation
        </Text>
      </View>
      <CalendarPicker />
      <View className="mt-6">
        <TimePicker
          selectedHour={selectedHour}
          selectedMinute={selectedMinute}
          onHourChange={setSelectedHour}
          onMinuteChange={setSelectedMinute}
        />
      </View>

      {/* Sélection du restaurant */}
      <View className="mt-6">
        <View className="flex flex-row gap-4 mb-4">
          <Image
            source={require("../../../assets/icons/chicken.png")}
            style={{ width: 18, height: 18, resizeMode: "contain" }}
          />
          <Text className="text-md font-sofia-bold text-orange-500">
            Restaurant
          </Text>
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: '#F3F4F6',
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: selectedRestaurant ? '#FF6B00' : '#E5E7EB',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          onPress={() => setShowRestaurantSelector(true)}
        >
          <View>
            <Text style={{ fontWeight: 'bold', color: '#222', fontSize: 16 }}>
              {selectedRestaurant ? selectedRestaurant.name : 'Choisir un restaurant'}
            </Text>
            {selectedRestaurant && (
              <Text style={{ color: '#666', fontSize: 13, marginTop: 2 }}>
                {selectedRestaurant.address}
              </Text>
            )}
          </View>
          <Text style={{ color: '#FF6B00', fontWeight: 'bold', fontSize: 15 }}>
            {selectedRestaurant ? 'Changer' : 'Sélectionner'}
          </Text>
        </TouchableOpacity>
      </View>

      <RestaurantSelector
        visible={showRestaurantSelector}
        onClose={() => setShowRestaurantSelector(false)}
      />

      <View className="flex items-start flex-row gap-3 mt-6">
        <Image
          source={require("../../../assets/icons/chicken.png")}
          style={{ width: 18, height: 18, resizeMode: "contain" }}
        />
        <Text className="text-md font-sofia-bold text-orange-500 mb-4">
          Type de table et nombre d'invités
        </Text>
      </View>
      <TableReservation 
        onTableTypeChange={setTableType} 
        onPersonCountChange={setNumberOfGuests} 
      />
    </View>
  );

  // Rendu de l'étape 2: Informations du client
  const renderStep2 = () => (
    <View className="px-6 mt-6">
      <View className="flex flex-row gap-4 mb-6">
        <Image
          source={require("../../../assets/icons/chicken.png")}
          style={{ width: 18, height: 18, resizeMode: "contain" }}
        />
        <Text className="text-md font-sofia-bold text-orange-500 mb-4">
          Informations de contact
        </Text>
      </View>

      <Text className="text-md font-sofia-light mb-3">
        Nom complet <Text className="text-red-500">*</Text>
      </Text>
      <View className="border-gray-200 border-[1px] p-2 rounded-3xl mb-4">
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          className="font-urbanist-regular"
          placeholder="Votre nom complet"
          editable={!loading}
        />
      </View>

      <Text className="text-md font-sofia-light mb-3">
        Numéro de téléphone <Text className="text-red-500">*</Text>
      </Text>
      <View className="border-gray-200 border-[1px] p-2 rounded-3xl mb-4">
        <TextInput
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          className="font-urbanist-regular"
          placeholder="Votre numéro de téléphone"
          keyboardType="phone-pad"
          editable={!loading}
        />
      </View>

      <Text className="text-md font-sofia-light mb-3">
        Email <Text className="text-red-500">*</Text>
      </Text>
      <View className="border-gray-200 border-[1px] p-2 rounded-3xl mb-4">
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          className="font-urbanist-regular"
          placeholder="Votre adresse email"
          editable={!loading}
        />
      </View>

      <Text className="text-md font-sofia-light mb-3">Notes </Text>
      <View className="border-gray-200 border-[1px] p-2 rounded-3xl mb-6">
        <TextInput
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          style={{ height: 100, textAlignVertical: "top" }}
          className="font-urbanist-regular"
          placeholder="Demandes spéciales ou informations supplémentaires"
          editable={!loading}
        />
      </View>
      
      {loading && (
        <Text className="text-center text-orange-500 italic mb-4">
          Chargement de vos informations...
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBar style="dark" />
      <View className="-mt-4">
        <CustomStatusBar />
      </View>

      {/* Header adapté au contexte de réservation */}
      <View className="-mt-4 px-3">
        <DynamicHeader
          displayType="back"
          title="Réserver une table"
          showCart={false}
          showProgressBar={true}
          progressPercent={currentStep === 1 ? 35 : 70}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Afficher l'étape courante */}
        {currentStep === 1 ? renderStep1() : renderStep2()}
      </ScrollView>

      {/* Boutons de navigation fixés en bas - isolés du reste de l'UI */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          onPress={handleCancel}
          style={styles.cancelButton}
          accessibilityLabel={
            currentStep === 1
              ? "Annuler la réservation"
              : "Retour à l'étape précédente"
          }
        >
          <Text style={styles.cancelButtonText}>
            {currentStep === 1 ? "Annuler" : "Retour"}
          </Text>
        </TouchableOpacity>
        <GradientButton 
          onPress={handleNext} 
          className="flex-1 ml-2"
          disabled={currentStep === 1 && !selectedRestaurant}
        >
          <Text style={{ color: "white" }}>
            {currentStep === 1 ? "Suivant" : "Suivant"}
          </Text>
        </GradientButton>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  timeSlotContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  timeSlot: {
    width: "30%",
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    alignItems: "center",
  },
  selectedTimeSlot: {
    backgroundColor: "#F17922",
  },
  timeSlotText: {
    color: "#333",
    fontSize: 14,
    fontFamily: "Urbanist-Medium",
  },
  selectedTimeSlotText: {
    color: "white",
  },
  tableTypeButton: {
    backgroundColor: "#F5F5F5",
    padding: 16,
    borderRadius: 20,
  },
  selectedTableType: {
    backgroundColor: "#F17922",
  },
  tableTypeText: {
    color: "#333",
    fontSize: 16,
    fontFamily: "Urbanist-Medium",
    textAlign: "center",
  },
  selectedTableTypeText: {
    color: "white",
  },
 
  bottomButtons: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#F17922",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
  },
  cancelButtonText: {
    color: "#F17922",
    fontSize: 16,
    fontFamily: "Urbanist-Medium",
  },
});

export default Reserver;
