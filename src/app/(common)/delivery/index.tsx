import { View, Text } from "react-native";
import React from "react";
import BackButton from "@/components/ui/BackButton";

const DeliveryScreen = () => {
  return (
    <View className="flex-1 bg-white p-6">
      <BackButton title="Livraison" />
    </View>
  );
};

export default DeliveryScreen;
