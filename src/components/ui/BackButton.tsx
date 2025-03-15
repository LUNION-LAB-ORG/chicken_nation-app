import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { router } from "expo-router";
import GradientText from "./GradientText";

interface BackButtonProps {
  title?: string;
  textClassName?: string;
  colors?: readonly [string, string, ...string[]];
  onBack?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({
  title,
  textClassName = "font-urbanist-medium text-xl text-center",
  colors = ["#F17922", "#FA6345"] as const,
  onBack,
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View className="flex items-center justify-between flex-row mt-10">
      <TouchableOpacity onPress={handleBack}>
        <Image
          source={require("../../assets/icons/arrow-left.png")}
          style={{ width: 30, height: 30, resizeMode: "contain" }}
        />
      </TouchableOpacity>

      {title && (
        <GradientText colors={colors} className={textClassName} fontSize={20}>
          {title}
        </GradientText>
      )}

      <View style={{ width: 30 }} />
    </View>
  );
};

export default BackButton;
