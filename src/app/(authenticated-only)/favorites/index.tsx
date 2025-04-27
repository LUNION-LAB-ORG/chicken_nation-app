import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import { ArrowLeft, Heart, Star } from "lucide-react-native";
import DynamicHeader from "@/components/home/DynamicHeader";
import { getUserFavorites, removeFromFavorites } from "@/services/api/favorites";
import { MenuItem } from "@/types";

const FavoritesScreen = () => {
  const router = useRouter();
  const [favorites, setFavorites] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les favoris de l'utilisateur
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const userFavorites = await getUserFavorites();
        setFavorites(userFavorites);
      } catch (err) {
        setError("Impossible de charger vos favoris.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // Gérer la suppression d'un favori
  const handleRemoveFavorite = async (dishId: string) => {
    try {
      const success = await removeFromFavorites(dishId);
      if (success) {
        // Mettre à jour la liste des favoris localement
        setFavorites(prev => prev.filter(item => item.id !== dishId));
      }
    } catch (error) {
      // Ignorer les erreurs silencieusement
    }
  };

  const handleMealPress = (mealId: string) => {
    router.push(`/(common)/products/${mealId}`);
  };

  // Afficher un indicateur de chargement
  if (isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <StatusBar style="dark" />
        <CustomStatusBar />
        <DynamicHeader
          displayType="back"
          title="Mes favoris"
          onBackPress={() => router.back()}
        />
        <ActivityIndicator size="large" color="#F97316" />
        <Text className="mt-4 text-gray-500 font-sofia-medium">Chargement de vos favoris...</Text>
      </View>
    );
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <StatusBar style="dark" />
        <CustomStatusBar />
        <DynamicHeader
          displayType="back"
          title="Mes favoris"
          onBackPress={() => router.back()}
        />
        <Text className="text-red-500 font-sofia-medium">{error}</Text>
        <TouchableOpacity
          className="mt-6 bg-orange-500 rounded-full px-8 py-3"
          onPress={() => router.push("/(tabs-user)/menu")}
        >
          <Text className="text-white font-sofia-medium">
            Découvrir le menu
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        {favorites.length === 0 ? (
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
            {favorites.map((meal) => (
              <TouchableOpacity
                key={meal.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                onPress={() => handleMealPress(meal.id)}
              >
                <View className="flex-row">
                  <Image
                    source={meal.image ? { uri: meal.image } : require("@/assets/images/food.png")}
                    className="w-24 h-24 rounded-xl"
                    style={{ resizeMode: "cover" }}
                  />
                  <View className="flex-1 ml-4 justify-between">
                    <View>
                      <View className="flex-row justify-between items-start">
                        <Text className="text-base font-sofia-medium text-gray-900 flex-1 mr-2">
                          {meal.name}
                        </Text>
                        <TouchableOpacity onPress={() => handleRemoveFavorite(meal.id)}>
                          <Heart size={20} color="#F97316" fill="#F97316" />
                        </TouchableOpacity>
                      </View>
                      <Text className="text-sm font-sofia-light text-gray-500 mt-1 line-clamp-2">
                        {meal.description}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-base font-sofia-medium text-orange-500">
                        {meal.price} FCFA
                      </Text>
                      <View className="flex-row items-center">
                        <Star size={16} color="#F97316" fill="#F97316" />
                        <Text className="text-xs font-sofia-medium text-gray-700 ml-1">
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
      </ScrollView>
    </View>
  );
};

export default FavoritesScreen;