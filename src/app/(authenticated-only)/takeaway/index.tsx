import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import GradientButton from "@/components/ui/GradientButton";
import GradientText from "@/components/ui/GradientText";
import { useRouter } from "expo-router";
import DynamicHeader from "@/components/home/DynamicHeader";
import TimePicker from "@/components/reservation/TimePickerProps";
import CalendarPicker from "@/components/reservation/CalendarPicker";
import useOrderTypeStore, { OrderType } from "@/store/orderTypeStore";
import RestaurantSelector from '@/components/checkout/RestaurantSelector';
import useOrderStore from '@/store/orderStore';
import { getRestaurantById } from '@/services/restaurantService';

type Step = "initial" | "schedule";

const TakeawayScreen = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("initial");
  const { setActiveType, setReservationData } = useOrderTypeStore();
  const { selectedRestaurantId } = useOrderStore();
  const [showRestaurantSelector, setShowRestaurantSelector] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);

  const [selectedHour, setSelectedHour] = useState("11");
  const [selectedMinute, setSelectedMinute] = useState("30");

  useEffect(() => {
    if (selectedRestaurantId) {
      getRestaurantById(selectedRestaurantId).then(setSelectedRestaurant);
    } else {
      setSelectedRestaurant(null);
    }
  }, [selectedRestaurantId]);

  const handleNext = () => {
    if (currentStep === "initial") {
      setCurrentStep("schedule");
    } else {
      // Activer le type de commande PICKUP
      
      setActiveType(OrderType.PICKUP);
      
      // Sauvegarder les sélections d'heure et de date
      const selectedTime = `${selectedHour}:${selectedMinute}`;
      setReservationData({
        time: selectedTime
      });
      
     
      
      // Naviguer vers le menu avec un paramètre indiquant le type de commande
      router.push({
        pathname: "/(tabs-user)/menu",
        params: { type: 'pickup' }
      });
    }
  };

  const handleBack = () => {
    if (currentStep === "schedule") {
      setCurrentStep("initial");
    } else {
      router.back();
    }
  };

  const renderInitialStep = () => (
    <View className="flex-1 items-center justify-between p-4 -mt-20">
      <View className="items-center justify-center flex-1">
        <Image
          source={require("../../../assets/images/totakeway.png")}
          className="w-80 h-80"
          style={{ resizeMode: "contain" }}
        />
      </View>

      <View className="flex-1 -mt-10">
        <GradientText>Des plats à emporter</GradientText>
        <Text className="text-start mt-4 font-sofia-light text-[#595959]">
          Parcourez notre menu complet et sélectionnez vos plats préférés.
          Notre cuisine prépare votre commande avec soin, en utilisant les
          mêmes ingrédients frais que pour notre service en salle. Choisissez
          l'heure qui vous convient pour récupérer votre commande. Notre
          système vous propose des créneaux disponibles pour organiser votre
          journée en toute tranquillité. Recevez une confirmation immédiate
          avec un numéro de commande unique et l'heure estimée de préparation.
          Tout est organisé pour que votre expérience soit fluide. À votre
          arrivée, dirigez-vous vers notre comptoir dédié aux commandes à
          emporter. Mentionnez votre nom ou présentez votre numéro de
          commande, et nos équipes vous remettront votre repas prêt à
          déguster. Nos emballages écologiques maintiennent vos plats à la
          température idéale pendant votre trajet. Profitez de la qualité de
          notre cuisine où bon vous semble !
        </Text>
      </View>

      <GradientButton onPress={handleNext} className="w-full">
        Suivant
      </GradientButton>
    </View>
  );

  const renderScheduleStep = () => (
    <View className="flex-1 items-center justify-between p-4">
      <View className="w-full">
        <Text className="text-2xl font-sofia-medium text-center mb-6">
          Planifier le retrait
        </Text>
      </View>

   
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="absolute top-0 left-0 right-0 z-50">
        <CustomStatusBar />
      </View>

      <View className="pb-4 mt-12">
        <DynamicHeader
          displayType="back"
          title={currentStep === "initial" ? "Je veux emporter" : "A emporter"}
          onBackPress={handleBack}
        />
      </View>

      {currentStep === "initial" ? (
        renderInitialStep()
      ) : (
        <View className="px-4">
          <View className="flex flex-row gap-4 mb-6">
            <Image
              source={require("../../../assets/icons/chicken.png")}
              style={{ width: 18, height: 18, resizeMode: "contain" }}
            />
            <Text className="text-md font-sofia-bold text-orange-500 mb-4">
              Date et heure de réservation
            </Text>
          </View>
          <CalendarPicker onDateSelect={(date) => {
            // Convertir la date en objet Date et l'enregistrer dans le store
            setReservationData({ date: new Date(date) });
          }} />
          <View className="mt-6">
            <TimePicker
              selectedHour={selectedHour}
              selectedMinute={selectedMinute}
              onHourChange={setSelectedHour}
              onMinuteChange={setSelectedMinute}
            />
          </View>
          {renderScheduleStep()}

          {/* Sélection du restaurant */}
          <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
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
                  <Text style={{ color: '#666', fontSize: 10, marginTop: 2 }}>
                    {selectedRestaurant.address.slice(0, 40)}
                  </Text>
                )}
              </View>
              <Text style={{ color: '#FF6B00', fontWeight: 'bold', fontSize: 13 }}>
                {selectedRestaurant ? 'Changer' : 'Sélectionner'}
              </Text>
            </TouchableOpacity>
          </View>

          <RestaurantSelector
            visible={showRestaurantSelector}
            onClose={() => setShowRestaurantSelector(false)}
          />

          <GradientButton 
            onPress={handleNext} 
            className="w-full mt-6"
            disabled={currentStep === 'schedule' && !selectedRestaurant}
          >
            Suivant
          </GradientButton>
        </View>
      )}
    </View>
  );
};

export default TakeawayScreen;
