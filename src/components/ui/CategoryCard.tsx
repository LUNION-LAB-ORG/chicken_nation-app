import {
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/app/context/AuthContext";
import { getAllCategories } from "@/services/categoryService";

const { width } = Dimensions.get("window");
const CARD_WIDTH = Math.floor((width - 40) / 2);

const CategoryCard = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();  
 
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        setError("Impossible de charger les catégories");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  const handleCardPress = (itemId: string) => {
    setSelectedId(selectedId === itemId ? null : itemId);
    const route = user ? "/(tabs-user)/menu" : "/(tabs-guest)/menu";
    router.push({
      pathname: route,
      params: { categoryId: itemId },
    });
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedId === item.id;

    return (
      <TouchableOpacity
        style={{ width: CARD_WIDTH, borderRadius: 35 }}
        className={`border border-slate-100 p-2 mb-4 overflow-hidden`}
        onPress={() => handleCardPress(item.id)}
      >
        {isSelected ? (
          <View className="absolute inset-0 bg-orange-light" />
        ) : (
          <View className="absolute inset-0 bg-white" />
        )}

        <View className="relative">
          <Image
            source={item.image ? { uri: item.image } : require('@/assets/images/food1.png')}
            style={{
              width: "100%",
              height: 130,
              resizeMode: "contain",
            }}
          />
          {item.is_promotion && (
            <View className="absolute top-3 left-3 bg-yellow px-3 py-2 rounded-xl">
              <Text className="text-xs font-sofia-bold text-gray-800">
                Promo
              </Text>
            </View>
          )}
        </View>
        <Text
          className={`mt-2 ml-2 text-sm font-sofia-regular ${
            isSelected ? "text-white" : "text-slate-600"
          }`}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FF6C00" />
      </View>
    );
  }

  if (error || categories.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-center text-gray-600 mb-2">
          {error || "Aucune catégorie disponible"}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={categories}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={{
        justifyContent: "space-between",
        paddingHorizontal: 16,
      }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
      scrollEnabled={false}
      nestedScrollEnabled={true}
    />
  );
};

export default CategoryCard;
