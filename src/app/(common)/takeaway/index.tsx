import { View, Text } from "react-native";
import React from "react";
import BackButton from "@/components/ui/BackButton";

const TakeawayScreen = () => {
  return (
    <View className="flex-1 bg-white p-6">
      <BackButton title="À emporter" />
    </View>
  );
};

export default TakeawayScreen;
