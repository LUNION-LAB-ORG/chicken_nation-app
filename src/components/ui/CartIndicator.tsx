import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import useCartStore from "@/store/cartStore";

const CartIndicator = () => {
  const totalItems = useCartStore((state) => state.totalItems);

  return (
    <TouchableOpacity onPress={() => router.push("/cart")} className="relative">
      <Image
        source={
          totalItems > 0
            ? require("../../assets/icons/cart-red.png")
            : require("../../assets/icons/cart.png")
        }
        style={{ width: 24, height: 24, resizeMode: "contain" }}
      />
      {totalItems > 0 && (
        <View className="absolute -bottom-0 -left-2 bg-yellow rounded-full w-5 h-5 items-center justify-center">
          <Text className="text-black text-xs font-sofia-bold">
            {totalItems}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CartIndicator;
