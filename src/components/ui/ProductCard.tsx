import {
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { menuItems, categories } from "@/data/MockedData";

const { width } = Dimensions.get("window");
const CARD_WIDTH = Math.floor((width - 40) / 2); 

const ProductCard = () => {
  const router = useRouter();
  
  // Utiliser les données de MockedData.ts
  const data = menuItems.slice(0, 6).map(item => {
    const category = categories.find(cat => cat.id === item.categoryId);
    return {
      id: item.id,
      name: item.name,
      promo: category?.promo || "Promo",
      price: parseInt(item.price),
      image: item.image,
    };
  });

  const handleProductPress = (productId) => {
    router.push(`/(common)/products/${productId}`);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={{ width: CARD_WIDTH }}
      className="bg-white rounded-xl border border-slate-100 p-2 mb-4 shadow-sm"
      onPress={() => handleProductPress(item.id)}
    >
      <View className="relative">
        <Image
          source={item.image}
          style={{
            width: "100%",
            height: 130,
            resizeMode: "contain",
          }}
        />
        <View className="absolute top-3 left-3 bg-orange-50 px-3 py-2 rounded-xl">
          <Text className="text-xs font-urbanist-medium text-orange-500">
            {item.promo}
          </Text>
        </View>
      </View>
      <View className="px-2 py-2">
        <Text className="text-sm font-urbanist-medium text-primary">
          {item.name}
        </Text>
        <View className="flex-row justify-between items-center mt-1">
          <Text className="text-sm font-urbanist-bold text-orange-500">
            {item.price} FCFA
          </Text>
          <TouchableOpacity 
            className="bg-orange-500 rounded-full p-1"
            onPress={() => handleProductPress(item.id)}
          >
            <Image
              source={require("../../assets/icons/plus-white.png")}
              style={{ width: 16, height: 16, resizeMode: "contain" }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={data}
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

export default ProductCard;
