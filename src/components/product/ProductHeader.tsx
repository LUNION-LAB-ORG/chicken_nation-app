import React from "react";
import { View, Image, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

type ProductHeaderProps = {
  image: string;
  isLiked: boolean;
  isPromo: boolean;
  discountPercentage?: number;
  onFavoriteToggle: () => void;
  isFavoriteLoading: boolean;
  onShare?: () => void;
};

/**
 * Composant d'en-tête du produit avec image, bouton favoris et badge promo
 */
const ProductHeader: React.FC<ProductHeaderProps> = ({
  image,
  isLiked,
  isPromo,
  discountPercentage,
  onFavoriteToggle,
  isFavoriteLoading,
  onShare,
}) => {
  return (
    <View
      className="relative rounded-3xl overflow-hidden"
      style={{
        borderWidth: 1,
        borderColor: "#FDE9DA",
        borderStyle: "solid",
        marginBottom: 10,
      }}
    >
      <Image
        source={{ uri: image }}
        className="w-full h-[300px]"
        style={{ resizeMode: "contain" }}
      />
      <View className="absolute bg-white border-[1px] border-gray-400 px-3 py-1.5 rounded-2xl top-4 right-4 flex-row">
        <TouchableOpacity
          className="p-2"
          onPress={onFavoriteToggle}
        >
          {isFavoriteLoading ? (
            <ActivityIndicator size="small" color="#F97316" />
          ) : (
            <FontAwesome name={isLiked ? "heart" : "heart-o"} size={20} color="#F97316" />
          )}
        </TouchableOpacity>
        {onShare && (
          <TouchableOpacity className="p-2 ml-1" onPress={onShare}>
            <Image
              source={require("../../assets/icons/share.png")}
              style={{ width: 20, height: 20, resizeMode: "contain" }}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Badge de promotion */}
      {isPromo && discountPercentage && (
        <View className="absolute top-4 left-4 bg-red-500 px-2 py-1 rounded-lg">
          <Text className="text-white font-urbanist-bold text-xs">
            -{discountPercentage}%
          </Text>
        </View>
      )}
    </View>
  );
};

export default ProductHeader;
