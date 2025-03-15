import {
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React from "react";

const { width } = Dimensions.get("window");
const CARD_WIDTH = Math.floor((width - 40) / 2); 

const ProductCard = () => {
  const data = [
    {
      id: "1",
      name: "Chicken Nation",
      promo: "Chicken Promo",
      price: 10000,
      image: require("../../assets/images/chicken-big-promo.png"),
    },
    {
      id: "2",
      name: "Méchant Méchant",
      promo: "Burgers",
      price: 10000,
      image: require("../../assets/images/mechant-mechant.png"),
    },
    {
      id: "3",
      name: "Mix Epice",
      promo: "Poulets",
      price: 10000,
      image: require("../../assets/images/mix.png"),
    },
    {
      id: "4",
      name: "Brownie",
      promo: "Desserts",
      price: 10000,
      image: require("../../assets/images/brownie.png"),
    },
    {
      id: "5",
      name: "Fitini",
      promo: "Sandwichs",
      price: 10000,
      image: require("../../assets/images/fitini.png"),
    },
    {
      id: "6",
      name: "Lunchs",
      promo: "Mix Epice",
      price: 10000,
      image: require("../../assets/images/lunch.png"),
    },
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={{ width: CARD_WIDTH }}
      className="bg-white rounded-xl border border-slate-100 p-2 mb-4"
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
        <View className="absolute top-3 left-3 bg-yellow px-3 py-2 rounded-xl">
          <Text className="text-xs font-sofia-bold text-gray-800">
            {item.promo}
          </Text>
        </View>
      </View>
      <Text className="mt-2 ml-2 text-sm font-sofia-regular text-slate-600">
        {item.name}
      </Text>
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
