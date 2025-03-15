import React, { useState } from "react";
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
import useReservationStore, { ReservationStep } from "@/store/reservationStore";
import TimePicker from "@/components/reservation/TimePickerProps";
import CalendarPicker from "@/components/reservation/CalendarPicker";
import TableReservation from "@/components/reservation/TableReservation";

const Reserver = () => {
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [numberOfGuests, setNumberOfGuests] = useState(4);
  const [tableType, setTableType] = useState("Table ronde de 2 à 8");
  const [currentStep, setCurrentStep] = useState(1);

  // États pour le formulaire de l'étape 2
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  // États pour la sélection de l'heure
  const [selectedHour, setSelectedHour] = useState("11");
  const [selectedMinute, setSelectedMinute] = useState("30");

  // Récupération des fonctions du store de réservation
  const { updateData, startReservation, setStep } = useReservationStore();

  const handleGuestChange = (increment) => {
    setNumberOfGuests((prev) => Math.max(1, prev + increment));
  };

  const handleTableTypeChange = (type) => {
    setTableType(type);
  };

 
  const handleNext = () => {
    if (currentStep === 1) {
      // Activer une réservation indépendante des fonctionnalités existantes
      startReservation();
      setStep(ReservationStep.DETAILS);
      setCurrentStep(2);

      // Mettre à jour l'objet date avec l'heure sélectionnée
      const newDate = new Date(date);
      newDate.setHours(parseInt(selectedHour));
      newDate.setMinutes(parseInt(selectedMinute));
      setDate(newDate);

    
      updateData({
        date: newDate,
        time: `${selectedHour}:${selectedMinute}`,
        numberOfPeople: numberOfGuests,
        tableType,
      });
    } else {
      // Valider les champs obligatoires
      if (!fullName.trim() || !phoneNumber.trim()) {
        alert("Veuillez renseigner votre nom et numéro de téléphone.");
        return;
      }

      // Mettre à jour les données 
      updateData({
        fullName,
        phoneNumber,
        notes,
      });

      // Passer à l'étape Menu avec progression 70%
      setStep(ReservationStep.MENU_SELECTION);

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
      <View className="flex items-start flex-row gap-3 mt-6">
        <Image
          source={require("../../../assets/icons/chicken.png")}
          style={{ width: 18, height: 18, resizeMode: "contain" }}
        />
        <Text className="text-md font-sofia-bold text-orange-500 mb-4">
          Nombre d'invités
        </Text>
      </View>
      <View className="mb-6">
        <TableReservation />
      </View>
    </View>
  );

  // Rendu de l'étape 2: Informations du client
  const renderStep2 = () => (
    <View className="px-6 mt-6">
      <View className="flex items-start flex-row gap-3 ">
        <Image
          source={require("../../../assets/icons/chicken.png")}
          style={{ width: 18, height: 18, resizeMode: "contain" }}
        />
        <Text className="text-md font-sofia-bold text-orange-500 mb-4">
          Informations utiles
        </Text>
      </View>

      <Text className="text-md font-sofia-light mb-3 mt-2">Nom complet </Text>
      <View className="border-gray-200 border-[1px] p-2 rounded-3xl mb-4">
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          className="font-urbanist-regular"
        />
      </View>

      <Text className="text-md font-sofia-light mb-3">
        Numéro de téléphone{" "}
      </Text>
      <View className="border-gray-200 border-[1px] p-2 rounded-3xl mb-4">
        <TextInput
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          className="font-urbanist-regular"
        />
      </View>

      <Text className="text-md font-sofia-light mb-3">Email </Text>
      <View className="border-gray-200 border-[1px] p-2 rounded-3xl mb-4">
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          className="font-urbanist-regular"
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
        />
      </View>
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
        <GradientButton onPress={handleNext} className="flex-1 ml-2">
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
