import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Modal de connexion pour les utilisateurs non authentifiés
 */
const LoginModal: React.FC<LoginModalProps> = ({ visible, onClose }) => {
  const router = useRouter();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl">
          <TouchableOpacity
            onPress={onClose}
            className="absolute left-5 top-[22px] z-10"
          >
            <Image
              source={require("../../assets/icons/arrow-down.png")}
              className="w-8 h-8"
            />
          </TouchableOpacity>

          <View className="items-center pt-6">
            <View className="flex flex-row items-center justify-center">
              <Image
                source={require("../../assets/icons/chicken.png")}
                className="w-7 h-7 mr-2 mb-5"
                style={{ resizeMode: "contain" }}
              />
              <Text className="font-blocklyn-grunge text-2xl text-orange-500 mb-4">
                CHICKEN NATION
              </Text>
            </View>
            <ImageBackground
              source={require("../../assets/images/sliderbackground.png")}
              className="w-full h-56"
            >
              <Text className="text-lg font-blocklyn-grunge text-white uppercase text-center my-6">
                Connecte-toi pour plus de fonctionnalités
              </Text>

              <View className="w-full relative mb-6">
                <Image
                  source={require("../../assets/images/loginbanner.png")}
                  className="absolute -top-28 left-1/2 w-[380px] h-[300px] z-10"
                  style={{
                    resizeMode: "contain",
                    transform: [{ translateX: -160 }],
                  }}
                />
              </View>
            </ImageBackground>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/authwithemail")}
              className="bg-orange-600 w-full h-14 z-20 items-center justify-center"
            >
              <Text className="text-base font-sofia-light text-white text-center my-4">
                Connexion ou inscription rapide et simple
              </Text>
            </TouchableOpacity>

            <View className="w-full ml-5 mb-48">
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  router.push("/(tabs-guest)/menu");
                }}
                className="flex-row items-center p-4 mt-4"
              >
                <Image
                  source={require("../../assets/icons/menu.png")}
                  className="w-6 h-6 mr-4"
                />
                <Text className="text-lg font-sofia-regular">Nos menus</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  onClose();
                  router.push("/reservation");
                }}
                className="flex-row items-center p-4"
              >
                <Image
                  source={require("../../assets/icons/table.png")}
                  className="w-6 h-6 mr-4"
                />
                <Text className="text-lg font-sofia-regular">
                  Réserver une table
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  onClose();
                  router.push("/(common)/restaurants");
                }}
                className="flex-row items-center p-4"
              >
                <Image
                  source={require("../../assets/icons/store.png")}
                  className="w-6 h-6 mr-4"
                />
                <Text className="text-lg font-sofia-regular">
                  Nos restaurants
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View className="w-full p-2 items-center justify-center bg-slate-200">
            <Text className="text-center text-slate-800 my-4">Version 1.0</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LoginModal;
