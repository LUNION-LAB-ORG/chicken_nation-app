import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";

type ProductInfoProps = {
  name: string;
  rating: string;
  price: string;
  originalPrice?: string;
  isPromo: boolean;
  isAuthenticated: boolean;
  onViewComments: () => void;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  description: string;
  discountPercentage?: number;
};

/**
 * Composant d'information du produit avec nom, prix, notation, quantité
 */
const ProductInfo: React.FC<ProductInfoProps> = ({
  name,
  rating,
  price,
  originalPrice,
  isPromo,
  isAuthenticated,
  onViewComments,
  quantity,
  onIncrement,
  onDecrement,
  description,
  discountPercentage,
}) => {
  return (
    <View>
      {/* Titre et évaluations */}
      <View className="flex-row justify-center items-center mt-8 mb-4">
        <Text className="text-3xl text-center font-urbanist-bold uppercase text-black">
          {name}
        </Text>
      </View>
      <View className="flex-row items-center mt-2">
        <FontAwesome name="star" size={16} color="#FFD700" />
        <Text className="ml-1 text-[13px] font-sofia-regular text-slate-500">
          {rating}
        </Text>
        <TouchableOpacity 
          className="ml-4" 
          onPress={isAuthenticated ? onViewComments : undefined}
        >
          <Text className="text-[13px] font-sofia-regular underline text-slate-500">
            Voir les commentaires
          </Text>
        </TouchableOpacity>
        {!isAuthenticated && (
          <TouchableOpacity onPress={() => router.push("/(tabs-guest)/login")} className="ml-4">
            <Text className="text-[11px] font-sofia-semibold uppercase bg-yellow p-2 rounded-lg text-slate-800">
              Connecte-toi pour voir
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Prix et quantité */}
      <View className="flex-row justify-between items-center mt-6">
        <View>
          {isPromo && originalPrice ? (
            <>
              <Text className="text-sm font-urbanist-regular text-gray-400 line-through">
                {originalPrice} FCFA
              </Text>
              <Text className="text-2xl font-urbanist-regular text-orange-500">
                {price} FCFA
              </Text>
              <Text className="text-sm font-urbanist-regular text-green-500">
                -{discountPercentage}%
              </Text>
            </>
          ) : (
            <Text className="text-2xl font-urbanist-regular text-orange-500">
              {price} FCFA
            </Text>
          )}
        </View>
        <View className="flex-row items-center ml-4">
          <TouchableOpacity
            className="border-orange-500 border-2 rounded-full p-[9px] py-[7px]"
            onPress={onDecrement}
          >
            <FontAwesome name="minus" size={18} className="text-sm" color="#f97316" />
          </TouchableOpacity>
          <Text className="mx-4 text-lg font-sofia-light text-black/70">
            {quantity.toString().padStart(2, "0")}
          </Text>
          <TouchableOpacity onPress={onIncrement}>
            <Image
              source={require("../../assets/icons/plus-rounded.png")}
              style={{ width: 38, height: 38, resizeMode: "contain" }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Description */}
      <Text className="mt-6 text-[16px] font-sofia-light text-[#595959]">
        {description}
      </Text>
    </View>
  );
};

export default ProductInfo;
