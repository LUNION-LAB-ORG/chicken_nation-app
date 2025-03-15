import React from "react";
import { View, Text, ScrollView, Image } from "react-native";
import { Send } from "lucide-react-native";
import GradientButton from "@/components/ui/GradientButton";

type RecapStepProps = {
  totalAmount: number;
  calculatedTVA: number;
  deliveryFee: number;
  finalTotal: number;
  onContinue: () => void;
};

export const RecapContent: React.FC<Omit<RecapStepProps, "onContinue">> = ({
  totalAmount,
  calculatedTVA,
  deliveryFee,
  finalTotal,
}) => (
  <View className="bg-white rounded-3xl p-5 mb-4 border border-orange-500/50">
    <View className="flex-row justify-between mb-2">
      <Text className="font-sofia-light text-gray-500">
        Montant de la commande
      </Text>
      <Text className="font-sofia-medium text-orange-500">
        {totalAmount.toLocaleString()} FCFA
      </Text>
    </View>
    <View className="flex-row justify-between mb-2">
      <Text className="font-sofia-light text-gray-500">TVA 5%</Text>
      <Text className="font-sofia-medium text-orange-500">
        {calculatedTVA.toLocaleString()} FCFA
      </Text>
    </View>
    <View className="flex-row justify-between mb-2">
      <Text className="font-sofia-light text-gray-500">Frais de livraison</Text>
      <Text className="font-sofia-medium text-orange-500">
        {deliveryFee.toLocaleString()} FCFA
      </Text>
    </View>
    <View className="border-t border-gray-200 my-2" />
    <View className="flex-row justify-between mt-2">
      <Text className="font-sofia-light text-gray-500">Net à payer</Text>
      <Text className="font-sofia-bold text-orange-500">
        {finalTotal.toLocaleString()} FCFA
      </Text>
    </View>
  </View>
);

const RecapStep: React.FC<RecapStepProps> = ({
  totalAmount,
  calculatedTVA,
  deliveryFee,
  finalTotal,
  onContinue,
}) => {
  return (
    <>
      <View className="flex-row items-center px-6 pt-4 pb-2">
        <Image
          source={require("@/assets/icons/chicken.png")}
          className="w-5 h-5"
        />
        <Text className="text-xl font-sofia-medium text-orange-500 ml-2">
          Récap
        </Text>
      </View>
      <ScrollView
        className="flex-1 mt-6 px-6"
        showsVerticalScrollIndicator={false}
      >
        <RecapContent
          totalAmount={totalAmount}
          calculatedTVA={calculatedTVA}
          deliveryFee={deliveryFee}
          finalTotal={finalTotal}
        />
      </ScrollView>
      <View className="px-4 py-4 bg-white border-t border-gray-100">
        <GradientButton onPress={onContinue}>
          <View className="flex-row items-center justify-center space-x-2">
            <Send size={24} color="white" />
            <Text className="text-white text-lg ml-3 font-urbanist-medium">
              Effectuer le paiement
            </Text>
          </View>
        </GradientButton>
      </View>
    </>
  );
};

export default RecapStep;
