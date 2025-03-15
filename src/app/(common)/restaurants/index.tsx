import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import BackButtonTwo from "@/components/ui/BackButtonTwo";
import GradientButton from "@/components/ui/GradientButton";
import { restaurants } from "@/data/MockedData";

/**
 * Liste des restaurants
 * Affiche tous les restaurants 
 */
const RestaurantsList: React.FC = () => {
  const router = useRouter();

  /**
   * Redirige vers la page de détails du restaurant sélectionné
 
   */
  const handleRestaurantClick = (id: string): void => {
    router.push(`/(common)/restaurants/${id}`);
  };

 
  const handleMenuClick = (
    e: React.MouseEvent<HTMLElement>,
    id: string,
  ): void => {
    e.stopPropagation();
    router.push({
      pathname: "/(common)/products",
      params: { restaurantId: id },
    });
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="absolute top-0 left-0 right-0 z-50">
        <CustomStatusBar />
      </View>

      <View className="px-6 pt-6 mb-4">
        <BackButtonTwo title="Nos restaurants" />
      </View>

      {/* Liste des restaurants */}
      {restaurants.map((restaurant) => (
        <TouchableOpacity key={restaurant.id}>
          <View className="flex border-[1px] border-gray-300 rounded-3xl mx-6 mb-6">
            <View className="flex flex-row items-center p-4">
              <Image
                source={require("../../../assets/icons/chicken.png")}
                style={{
                  width: 18,
                  height: 18,
                  resizeMode: "contain",
                  marginTop: -3,
                }}
              />
              <Text className="text-[16px] font-blocklyn-grunge text-orange-500">
                {" "}
                {restaurant.name}
              </Text>
            </View>

            <View className="flex-row flex items-center p-4 pt-0">
              <Image
                source={require("../../../assets/icons/localisation.png")}
                style={{ width: 24, height: 24, resizeMode: "contain" }}
              />
              <Text className="text-[14px] text-slate-800 font-sofia-light ml-2">
                {restaurant.address}, {`\n`}
                {restaurant.location}
              </Text>
            </View>

            <View className="flex-row flex justify-between items-center p-4 pt-0">
              <View className="flex-row flex items-center">
                <Image
                  source={require("../../../assets/icons/phone.png")}
                  style={{ width: 24, height: 24, resizeMode: "contain" }}
                />
                <Text className="text-[14px] text-slate-800 font-sofia-light ml-2">
                  {restaurant.phone}
                </Text>
              </View>
              <View className="flex-row flex items-center">
                <View
                  className={`w-3 -mb-1 h-3 rounded-full ${restaurant.isOpen ? "bg-green-600" : "bg-red-600"}`}
                />
                <Text
                  className={`text-[14px] font-sofia-light ml-2 ${restaurant.isOpen ? "text-green-600" : "text-red-600"}`}
                >
                  {restaurant.isOpen ? "Ouvert" : "Fermé"}
                </Text>
                <View className="w-[1px] h-4 bg-slate-400 ml-2 -mb-1" />
                <Text className="text-[14px] text-slate-400 font-sofia-light ml-2">
                  {restaurant.isOpen
                    ? `Ferme à ${restaurant.closingTime}`
                    : `Ouvre à ${restaurant.openingTime}`}
                </Text>
              </View>
            </View>

            <View className="flex-row flex justify-between items-center p-4 pt-0">
              <Text className="text-slate-400 text-[12px] font-sofia-regular">
                Livraison
              </Text>
              <Text className="text-slate-400 text-[12px] font-sofia-regular">
                Ouvre à partir de {restaurant.deliveryStartTime}
              </Text>
            </View>

            <View className="p-4 pt-1">
              <TouchableOpacity activeOpacity={0.7}>
                <GradientButton
                  onPress={() => handleRestaurantClick(restaurant.id)}
                  className="items-center justify-center "
                >
                  <View className="flex-row flex items-center">
                    <Image
                      source={require("../../../assets/icons/menu-white.png")}
                      style={{ width: 24, height: 24, resizeMode: "contain" }}
                    />
                    <Text className="text-white text-center font-urbanist-medium text-lg ml-2">
                      Voir le menu
                    </Text>
                  </View>
                </GradientButton>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default RestaurantsList;
