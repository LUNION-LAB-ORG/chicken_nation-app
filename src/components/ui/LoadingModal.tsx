import React from "react";
import { View, Text, Modal } from "react-native";
import Spinner from "./Spinner";

interface LoadingModalProps {
  visible: boolean;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ visible }) => {
  return (
    <Modal transparent visible={visible} animationType="slide">
      <View className="flex-1 justify-end h-72">
        <View className="bg-white rounded-t-3xl p-6 pt-24 items-center space-y-4">
          <Spinner size={58} />
          <Text className="font-urbanist-medium text-base text-gray-700 mb-16 mt-16">
            Vérification en cours
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default LoadingModal;
