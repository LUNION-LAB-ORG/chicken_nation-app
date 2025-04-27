import { View, Text, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Restaurant } from "@/types";
import { getRestaurantById } from "@/services/restaurantService";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import BackButtonTwo from "@/components/ui/BackButtonTwo";
import GradientButton from "@/components/ui/GradientButton";
import { StatusBar } from "expo-status-bar";

const RestaurantDetails: React.FC = () => {
  const router = useRouter();
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!restaurantId) {
        setError("ID du restaurant manquant");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getRestaurantById(restaurantId);
        setRestaurant(data);
        setError(null);
      } catch (err) {
        console.error(`Erreur lors du chargement du restaurant ${restaurantId}:`, err);
        setError("Impossible de charger les détails du restaurant");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [restaurantId]);

  /**
   * Redirige vers le menu du restaurant sélectionné
   */
  const handleMenuClick = (): void => {
    if (restaurant) {
      router.push({
        pathname: "/(tabs-guest)/menu",
        params: { restaurantId: restaurant.id },
      });
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <StatusBar style="dark" />
        <CustomStatusBar />
        <ActivityIndicator size="large" color="#FF9F0D" />
      </View>
    );
  }

  if (error || !restaurant) {
    return (
      <View className="flex-1 bg-white justify-center items-center px-6">
        <StatusBar style="dark" />
        <CustomStatusBar />
        <Text className="text-red-500 text-center">{error || "Restaurant non trouvé"}</Text>
        <TouchableOpacity 
          className="mt-4 bg-orange-500 py-2 px-4 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white">Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="absolute top-0 left-0 right-0 z-50">
        <CustomStatusBar />
      </View>

      <View className="pt-8">
        <View className="px-6 mb-5">
          <BackButtonTwo title={restaurant.name} />
        </View>
        <Image
          source={require("../../../assets/images/store.png")}
          style={{ width: "100%", height: 317, resizeMode: "cover" }}
        />
      </View>

      <View className="flex px-6 mb-4">
        <View className="flex flex-row items-center py-4">
          <Image
            source={require("../../../assets/icons/chicken.png")}
            style={{
              width: 18,
              height: 18,
              resizeMode: "contain",
              marginTop: -3,
            }}
          />
          <Text className="text-[16px] font-blocklyn-grunge text-orange-500 ml-2">
            {restaurant.name}
          </Text>
        </View>

        <View className="flex-row items-center py-4 -mt-4">
          <Image
            source={require("../../../assets/icons/localisation.png")}
            style={{ width: 24, height: 24, resizeMode: "contain" }}
          />
          <Text className="text-[14px] text-[#424242] font-sofia-light ml-2">
            {restaurant.address}, {restaurant.location}
          </Text>
        </View>

        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Image
              source={require("../../../assets/icons/phone.png")}
              style={{ width: 24, height: 24, resizeMode: "contain" }}
            />
            <Text className="text-[14px] text-[#424242] font-sofia-light ml-2">
              {restaurant.phone}
            </Text>
          </View>
          <View className="flex-row items-center">
            <View
              className={`w-3 h-3 rounded-full ${restaurant.isOpen ? "bg-green-600" : "bg-red-600"}`}
            />
            <Text
              className={`text-[14px] font-sofia-light ml-2 ${restaurant.isOpen ? "text-green-600" : "text-red-600"}`}
            >
              {restaurant.isOpen ? "Ouvert" : "Fermé"}
            </Text>
            <View className="w-[1px] h-4 bg-slate-400 mx-2" />
            <Text className="text-[14px] text-slate-400 font-sofia-light">
              {restaurant.isOpen
                ? `Ferme à ${restaurant.closingTime}`
                : `Ouvre à ${restaurant.openingTime}`}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center py-4">
          <Text className="text-slate-400 text-[12px] font-sofia-regular">
            Livraison
          </Text>
          <Text className="text-slate-400 text-[12px] font-sofia-regular">
            Ouvre à partir de {restaurant.deliveryStartTime}
          </Text>
        </View>

        {/* Horaires d'ouverture */}
        <View className="py-6">
          <View className="flex-row items-center mb-6">
            <Image
              source={require("../../../assets/icons/chicken.png")}
              style={{ width: 18, height: 18, resizeMode: "contain" }}
            />
            <Text className="text-lg font-sofia-light text-orange-500 ml-2">
              Horaire d'ouverture
            </Text>
          </View>
          {restaurant.schedule.map((daySchedule, index) => (
            <View
              key={index}
              className="flex-row justify-between items-center py-1"
            >
              <Text className="text-[14px] text-[#595959] font-sofia-light">
                {daySchedule.day}
              </Text>
              <Text className="text-[14px] text-[#595959] font-sofia-light mr-44">
                {daySchedule.openingTime} - {daySchedule.closingTime}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <View className="p-6 pt-4">
        <TouchableOpacity activeOpacity={0.7}>
          <GradientButton
            onPress={handleMenuClick}
            className="items-center justify-center"
          >
            <View className="flex-row flex items-center">
              <Image
                source={require("../../../assets/icons/cartwhite.png")}
                style={{ width: 20, height: 20, resizeMode: "contain" }}
              />
              <Text className="text-white text-center font-urbanist-medium text-xl ml-3">
                Commander
              </Text>
            </View>
          </GradientButton>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RestaurantDetails;
