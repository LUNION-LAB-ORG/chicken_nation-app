import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { Send } from "lucide-react-native";
import GradientButton from "@/components/ui/GradientButton";
import { PaymentMethod, paymentMethods } from "./types";
import { RecapContent } from "./RecapStep";

type ConfirmationStepProps = {
  selectedPayment: PaymentMethod | null;
  totalAmount: number;
  calculatedTVA: number;
  deliveryFee: number;
  finalTotal: number;
  onChangePayment: () => void;
  onContinue: () => void;
  isLoading?: boolean;
};

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  selectedPayment,
  totalAmount,
  calculatedTVA,
  deliveryFee,
  finalTotal,
  onChangePayment,
  onContinue,
  isLoading = false,
}) => {
  const selectedMethod = paymentMethods.find(
    (method) => method.id === selectedPayment,
  );

  return (
    <>
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center mt-2 mb-6">
          <Image
            source={require("@/assets/icons/chicken.png")}
            className="w-5 h-5"
          />
          <Text className="text-xl font-sofia-light text-orange-500 ml-2">
            Récap
          </Text>
        </View>

        <RecapContent
          totalAmount={totalAmount}
          calculatedTVA={calculatedTVA}
          deliveryFee={deliveryFee}
          finalTotal={finalTotal}
        />

        <View className="flex-row items-center mt-6 mb-5">
          <Image
            source={require("@/assets/icons/chicken.png")}
            className="w-5 h-5"
          />
          <Text className="text-xl font-sofia-light text-orange-500 ml-2">
            Moyen de paiement
          </Text>
        </View>

        {selectedMethod && (
          <TouchableOpacity onPress={onChangePayment} className="mb-4">
            <View className="flex-row items-center justify-between p-5 bg-white border-[1px] border-orange-500 rounded-3xl">
              <View className="flex-row items-center flex-1">
                <Image source={selectedMethod.icon} className="w-8 h-8 mr-4" />
                <Text className="font-sofia-light text-gray-900">
                  {selectedMethod.name}
                </Text>
              </View>
              <Image
                source={require("@/assets/icons/arrow-right-2.png")}
                className="w-8 h-8"
                style={{ resizeMode: "contain" }}
              />
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
      <View className="px-4 py-4 bg-white border-t border-gray-100">
        <GradientButton onPress={onContinue} disabled={isLoading}>
          <View className="flex-row items-center gap-3 justify-center space-x-2">
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Send size={24} color="white" />
            )}
            <Text className="text-white text-lg font-urbanist-medium">
              {isLoading ? "Traitement en cours..." : "Effectuer le paiement"}
            </Text>
          </View>
        </GradientButton>
      </View>
    </>
  );
};

export default ConfirmationStep;
