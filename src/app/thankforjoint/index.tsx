import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import GradientText from "@/components/ui/GradientText";
import GradientButton from "@/components/ui/GradientButton";
import { useRouter } from "expo-router";

const ThankForJoint: React.FC = () => {
  const router = useRouter();

  const handleContinue = () => {
    router.push("/autorisations");
  };

  return (
    <>
      <StatusBar style="light" />
      <ImageBackground
        source={require("../../assets/images/thankforjoint.png")}
        className="w-[103%] h-[100%] absolute left-[-1%] flex-1"
      >
        <StatusBar style="dark" />

        <View className="flex-1 justify-between">
          <View className="flex-1 items-center justify-center">
            <Image
              source={require("../../assets/icons/seau.png")}
              style={{ width: 300, height: 240, resizeMode: "contain" }}
            />

            <Text className="mt-4 text-3xl text-center font-urbanist-bold text-white">
              Merci de nous rejoindre
            </Text>

            <Text className="text-base font-sofia-light  text-center text-white mt-16">
              Venez découvrir ce que avons prévu pour vous
            </Text>
          </View>
          <View className="flex p-6">
            <TouchableOpacity
              className="w-full bg-transparent border-2 border-white rounded-3xl p-4 items-center justify-center"
              onPress={handleContinue}
            >
              <Text className="text-white font-sofia-medium">Continuer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </>
  );
};

export default ThankForJoint;
