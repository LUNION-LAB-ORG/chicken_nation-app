import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import { ArrowLeft, Heart, Star } from "lucide-react-native";
import DynamicHeader from "@/components/home/DynamicHeader";

const FavoritesScreen = () => {
  const router = useRouter();

  const favoriteMeals = [
    {
      id: "1",
      name: "CHICKEN DAYS NORMAL",
      price: "6000",
      rating: 4.5,
      description: "Notre délicieux poulet dans sa version classique",
      image: require("@/assets/images/food.png"),
    },
    {
      id: "2",
      name: "CHICKEN DAYS EPICE",
      price: "6000",
      rating: 4.8,
      description: "Notre poulet signature avec un mélange d'épices spéciales",
      image: require("@/assets/images/food.png"),
    },
  ];

  const handleMealPress = (mealId: string) => {
    router.push(`/(common)/products/${mealId}`);
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <CustomStatusBar />

      <View className="-mt-6">
        <DynamicHeader
          displayType="back"
          title="Mes favoris"
          onBackPress={() => router.back()}
        />
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {favoriteMeals.length === 0 ? (
          <View className="flex-1 items-center justify-center mt-20">
            <Image
              source={require("@/assets/icons/no-result.png")}
              className="w-32 h-32"
              style={{ resizeMode: "contain" }}
            />
            <Text className="text-lg font-sofia-medium text-gray-900 mt-4">
              Aucun plat favori
            </Text>
            <Text className="text-sm font-sofia-light text-gray-500 text-center mt-2">
              Explorez notre menu et ajoutez vos plats préférés aux favoris
            </Text>
            <TouchableOpacity
              className="mt-6 bg-orange-500 rounded-full px-8 py-3"
              onPress={() => router.push("/(tabs-user)/menu")}
            >
              <Text className="text-white font-sofia-medium">
                Découvrir le menu
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="mt-6 space-y-4">
            {favoriteMeals.map((meal) => (
              <TouchableOpacity
                key={meal.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                onPress={() => handleMealPress(meal.id)}
              >
                <View className="flex-row">
                  <Image
                    source={meal.image}
                    className="w-24 h-24 rounded-xl"
                    style={{ resizeMode: "cover" }}
                  />
                  <View className="flex-1 ml-4 justify-between">
                    <View>
                      <View className="flex-row justify-between items-start">
                        <Text className="text-base font-sofia-medium text-gray-900 flex-1 mr-2">
                          {meal.name}
                        </Text>
                        <TouchableOpacity>
                          <Heart size={20} color="#F97316" fill="#F97316" />
                        </TouchableOpacity>
                      </View>
                      <Text className="text-sm font-sofia-light text-gray-500 mt-1 line-clamp-2">
                        {meal.description}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-base font-sofia-medium text-orange-500">
                        {meal.price} FCFA
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Star size={16} color="#FFB800" fill="#FFB800" />
                        <Text className="ml-1 text-sm font-sofia-medium text-gray-700">
                          {meal.rating}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
};

export default FavoritesScreen; 