import React from "react";
import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from "react-native";
import { ShieldCheck } from "lucide-react-native";
import GradientButton from "@/components/ui/GradientButton";

type SimpleConfirmationModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
};

const SimpleConfirmationModal: React.FC<SimpleConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-[90%] bg-white rounded-3xl p-6">
          <View className="items-center mb-4">
            <View className="w-16 h-16 rounded-full bg-orange-100 items-center justify-center mb-4">
              <ShieldCheck size={32} color="#F97316" />
            </View>
            <Text className="text-xl font-sofia-medium text-gray-900 text-center">
              Confirmation de paiement
            </Text>
            <Text className="text-gray-500 text-center mt-2">
              Êtes-vous sûr de vouloir procéder au paiement ?
            </Text>
          </View>

          <View className="flex-row gap-4 mt-4">
            <TouchableOpacity
              className="flex-1 py-3 rounded-xl border border-orange-500"
              onPress={onClose}
              disabled={isLoading}
            >
              <Text className="text-center text-orange-500 font-sofia-medium">
                Annuler
              </Text>
            </TouchableOpacity>
            <GradientButton
              onPress={onConfirm}
              className="flex-1"
              disabled={isLoading}
            >
              <View className="flex-row items-center justify-center gap-2">
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : null}
                <Text className="text-white font-sofia-medium">
                  {isLoading ? "Traitement..." : "Confirmer"}
                </Text>
              </View>
            </GradientButton>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SimpleConfirmationModal;
