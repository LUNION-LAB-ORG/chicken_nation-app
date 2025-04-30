import React from "react";
import { View, Text, TouchableOpacity, Modal, Image, ActivityIndicator } from "react-native";
import { X } from "lucide-react-native";
import GradientButton from "@/components/ui/GradientButton";
import { PaymentMethod, paymentMethods } from "./types";

type ConfirmationModalProps = {
  visible: boolean;
  selectedPayment: PaymentMethod | null;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
};

const getPaymentInstructions = (method: PaymentMethod): string => {
  switch (method) {
    case "orange":
      return "Tapez #144#";
    case "moov":
      return "Tapez : *155#";
    case "wave":
      return "Rendez-vous dans l'application";
    case "momo":
      return "Tapez : *155*6*1#";
    case "card":
      return "Validez votre paiement par carte";
    default:
      return "";
  }
};

const getPaymentIcon = (method: PaymentMethod): any => {
  if (method === "card") {
    return require("@/assets/icons/payments/card-preview.png");
  }
  return paymentMethods.find((m) => m.id === method)?.icon;
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  selectedPayment,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        className="flex-1 justify-end bg-black/50"
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          className="bg-white rounded-t-3xl"
        >
          <View className="p-6">
            <View className="flex-row justify-between items-center mb-8">
              <View className="w-6" />
              <Text className="text-xl font-sofia-bold text-gray-900">
                Finalisation du paiement
              </Text>
              <TouchableOpacity onPress={onClose} className="w-6">
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View className="items-center space-y-4 mb-8">
              <Text className="text-md font-sofia-light text-center">
                {selectedPayment === "card"
                  ? "Paiement par carte"
                  : `Client ${selectedPayment && paymentMethods.find((m) => m.id === selectedPayment)?.name}`}
              </Text>

              <Text className="text-md font-sofia-light text-orange-500">
                {selectedPayment && getPaymentInstructions(selectedPayment)}
              </Text>
              {selectedPayment && (
                <Image
                  source={getPaymentIcon(selectedPayment)}
                  className="w-32 h-32 mt-8"
                  style={{ resizeMode: "contain" }}
                />
              )}
            </View>

            <GradientButton onPress={onConfirm} className="w-full" disabled={isLoading}>
              <View className="flex-row items-center justify-center gap-2">
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : null}
                <Text className="text-white text-lg font-urbanist-medium">
                  {isLoading ? "Traitement..." : "Procéder"}
                </Text>
              </View>
            </GradientButton>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default ConfirmationModal;
