import React from "react";
import { View, Text, TouchableOpacity, Modal, Image } from "react-native";
import { KeypadKey, keypadMapping } from "./types";

type PhoneModalProps = {
  visible: boolean;
  phoneNumber: string;
  onClose: () => void;
  onConfirm: () => void;
  onNumberPress: (num: KeypadKey) => void;
  onDelete: () => void;
};

const renderKeypadButton = (num: KeypadKey): JSX.Element => (
  <View className="items-center justify-center">
    <Text className="text-2xl font-urbanist-medium">{num}</Text>
    <Text className="text-[10px] font-urbanist-bold text-gray-900 mt-[-1px]">
      {keypadMapping[num]}
    </Text>
  </View>
);

const PhoneModal: React.FC<PhoneModalProps> = ({
  visible,
  phoneNumber,
  onClose,
  onConfirm,
  onNumberPress,
  onDelete,
}) => {
  const isPhoneNumberValid = phoneNumber.length === 10;

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
          <View className="bg-white p-5 border-[#595959]/30 border-[1px] mx-6 rounded-3xl mt-8 mb-6">
            <Text className="text-base font-sofia-light mb-12 text-slate-700">
              {phoneNumber || "Numéro de téléphone à prélever"}
            </Text>
          </View>

          <View className="flex-row gap-4 justify-between px-6 mb-6 space-x-4">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-white border-orange-500 border-[1px] rounded-3xl py-4 items-center"
            >
              <Text className="font-sofia-medium text-lg text-orange-500">
                Annuler
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              className={`flex-1 rounded-3xl py-4 items-center ${
                isPhoneNumberValid ? "bg-orange-500" : "bg-orange-500/50"
              }`}
              disabled={!isPhoneNumberValid}
            >
              <Text className="font-sofia-medium text-lg text-white">
                Suivant
              </Text>
            </TouchableOpacity>
          </View>

          {/* Clavier numérique */}
          <View className="flex-row flex-wrap justify-between bg-gray-200 pt-2 pb-10">
            {(["1", "2", "3", "4", "5", "6", "7", "8", "9"] as KeypadKey[]).map(
              (num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => onNumberPress(num)}
                  className="w-[32%] h-16 mb-1 my-1 justify-center items-center bg-white rounded-md"
                  style={{ elevation: 2 }}
                >
                  {renderKeypadButton(num)}
                </TouchableOpacity>
              ),
            )}
            <View className="w-[32%] rounded-xl">
              <View className="w-[80px] h-16" />
            </View>
            <TouchableOpacity
              onPress={() => onNumberPress("0")}
              className="w-[32%] mt-1 h-16 bg-white justify-center items-center rounded-xl"
              style={{ elevation: 2 }}
            >
              {renderKeypadButton("0")}
            </TouchableOpacity>
            <View className="w-[32%] items-center justify-center">
              <TouchableOpacity
                onPress={onDelete}
                className="w-[80px] h-16 items-center justify-center"
              >
                <Image
                  source={require("@/assets/icons/delete.png")}
                  className="w-8 h-8"
                  style={{ resizeMode: "contain" }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default PhoneModal;
