import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import GradientButton from "@/components/ui/GradientButton";
import { PaymentMethod, paymentMethods } from "./types";

type PaymentStepProps = {
  selectedPayment: PaymentMethod | null;
  onPaymentMethodSelect: (method: PaymentMethod) => void;
  onContinue: () => void;
};

const PaymentStep: React.FC<PaymentStepProps> = ({
  selectedPayment,
  onPaymentMethodSelect,
  onContinue,
}) => {
  return (
    <>
      <ScrollView className="flex-1 px-6">
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            onPress={() => onPaymentMethodSelect(method.id)}
            className="mb-4"
          >
            <View className="flex-row items-center justify-between p-4 border border-gray-200 rounded-2xl">
              <View className="flex-row items-center flex-1">
                <Image source={method.icon} className="w-8 h-8 mr-4" />
                <Text className="font-sofia-medium text-gray-900">
                  {method.name}
                </Text>
              </View>
              <View
                className={`w-8 h-8 rounded-full border-2 items-center justify-center ${
                  selectedPayment === method.id
                    ? "border-orange-500 bg-white"
                    : "border-orange-500 bg-white"
                }`}
              >
                {selectedPayment === method.id && (
                  <View className="w-5 h-5 rounded-full bg-orange-500" />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View className="px-4 py-4 bg-white border-t border-gray-100">
        <GradientButton onPress={onContinue} disabled={!selectedPayment}>
          <Text className="text-white text-lg font-urbanist-medium">
            Continuer
          </Text>
        </GradientButton>
      </View>
    </>
  );
};

export default PaymentStep;
