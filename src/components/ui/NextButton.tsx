import { Image, Platform, TouchableOpacity } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";

interface NextButtonProps {
  onPress: () => void;
}

const NextButton: React.FC<NextButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      className="w-22 h-22 rounded-4xl items-center justify-center"
      onPress={onPress}
   
    >
      <LinearGradient
        className="p-6 "
        colors={["#F17922", "#FA6345"]}
        style={{ borderRadius: 50,padding: Platform.OS === "ios" ? 12 : 12 }}
      >
        <Image
          source={require("@/assets/icons/arrow-right.png")}
          style={{ width: 20, height: 20, resizeMode: "contain" }}
        />
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default NextButton;