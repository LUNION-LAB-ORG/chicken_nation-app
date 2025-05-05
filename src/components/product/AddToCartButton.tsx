import React from "react";
import { View, Text, Image, ActivityIndicator } from "react-native";
import GradientButton from "@/components/ui/GradientButton";

type AddToCartButtonProps = {
  isLoading: boolean;
  totalPrice: string;
  onPress: () => void;
  disabled?: boolean;
};

/**
 * Bouton d'ajout au panier avec prix et état de chargement
 */
const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  isLoading,
  totalPrice,
  onPress,
  disabled = false,
}) => {
  return (
    <GradientButton
      onPress={onPress}
      disabled={isLoading || disabled}
      className="flex-1"
    >
      <View className="flex-row items-center justify-center">
        {isLoading ? (
          <ActivityIndicator
            color="white"
            size="small"
            style={{ marginRight: 8 }}
          />
        ) : (
          <Image
            source={require("../../assets/icons/cartwhite.png")}
            style={{
              width: 24,
              height: 24,
              resizeMode: "contain",
              marginRight: 8,
            }}
          />
        )}
        <Text className="text-white text-lg font-urbanist-medium">
          {isLoading ? "Ajout en cours..." : `Ajouter au panier (${totalPrice})`}
        </Text>
      </View>
    </GradientButton>
  );
};

export default AddToCartButton;
