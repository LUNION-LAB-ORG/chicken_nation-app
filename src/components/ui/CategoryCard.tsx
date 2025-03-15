import {
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/app/context/AuthContext";
import { categories } from "@/data/MockedData";

const { width } = Dimensions.get("window");
const CARD_WIDTH = Math.floor((width - 40) / 2);

const CategoryCard = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();  
 
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
            source={item.image}
            style={{
              width: "100%",
              height: 130,
              resizeMode: "contain",
            }}
          />
          {item.promo && (
            <View className="absolute top-3 left-3 bg-yellow px-3 py-2 rounded-xl">
              <Text className="text-xs font-sofia-bold text-gray-800">
                {item.promo}
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
