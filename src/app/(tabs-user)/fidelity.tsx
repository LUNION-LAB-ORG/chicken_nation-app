"use client";

import type React from "react";
import { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ImageBackground,
} from "react-native";  
import { StatusBar } from "expo-status-bar";
import DynamicHeader from "@/components/home/DynamicHeader";
import CustomStatusBar from "@/components/ui/CustomStatusBar";

 
const backgrounds = {
  default: require("../../assets/images/fidelitywhite.png"),
  gold: require("../../assets/images/fidelityorange.png"),
};

const chickenStars = {
  default: require("../../assets/icons/chicken.png"),
  gold: require("../../assets/icons/chicken-white.png"),
};

const rewardImages = {
  chicken: require("../../assets/icons/cuisse.png"),
};

interface LoyaltyStamp {
  id: number;
  image: any;
  isEarned: boolean;
}

const Fidelity: React.FC = () => {
  // État pour gérer le niveau de fidélité et les tampons gagnés
  const [cardLevel, setCardLevel] = useState<"default" | "gold">("default");
  const [stamps, setStamps] = useState<LoyaltyStamp[]>([
    { id: 1, image: rewardImages.chicken, isEarned: false },
    { id: 2, image: rewardImages.chicken, isEarned: false },
    { id: 3, image: rewardImages.chicken, isEarned: false },
    { id: 4, image: rewardImages.chicken, isEarned: false },
    { id: 5, image: rewardImages.chicken, isEarned: false },
    { id: 6, image: rewardImages.chicken, isEarned: false },
  ]);

  // Fonction pour ajouter un tampon 
  const addStamp = () => {
    const nextEmptyIndex = stamps.findIndex((stamp) => !stamp.isEarned);
    if (nextEmptyIndex !== -1) {
      const newStamps = [...stamps];
      newStamps[nextEmptyIndex].isEarned = true;
      setStamps(newStamps);

      // Mise à jour du niveau de la carte en fonction du nombre de tampons
      const earnedCount = newStamps.filter((stamp) => stamp.isEarned).length;
      if (earnedCount >= 5) {
        setCardLevel("gold");
      } else if (earnedCount >= 3) {
        setCardLevel("default");
      }
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <CustomStatusBar />
      
      {/* Header fixe en haut */}
      <View className="px-4 z-10">
        <DynamicHeader
          displayType="logo"
          title="Fidélité"
          showCart={true}
        />
      </View>

      {/* Titre de la section */}
      <View className="flex-row items-center px-6  pt-4">
        <Image
          source={require("../../assets/icons/chicken.png")}
          className="w-5 h-5"
          resizeMode="contain"
        />
        <Text className="text-orange-500 text-lg font-sofia-light ml-2">
          Fidélisation Chicken Nation
        </Text>
      </View>

      {/* Carte de fidélité */}
      <View className="px-6 mt-6">
        <ImageBackground
          source={backgrounds[cardLevel]}
          className="w-full aspect-[1.5] rounded-2xl overflow-hidden"
          imageStyle={{ borderRadius: 16 }}
        >
          <View className="p-6">
            <Text className="text-center text-white font-sofia-bold text-lg mb-4">
              CARTE DE FIDÉLITÉ
            </Text>

            <Image
              source={chickenStars[cardLevel]}
              className="w-16 h-16 self-center mb-4"
              resizeMode="contain"
            />

            <View className="bg-[#FFB800] rounded-full py-2 px-4 mb-6">
              <Text className="text-center text-white text-[10px] font-sofia-regular">
                La 6ème fois que tu commanderas sur l'appli, Profite d'un repas
                offert
              </Text>
            </View>

            {/* Grille des tampons */}
            <View className="flex-row justify-between pb-4">
              {stamps.map((stamp, index) => (
                <TouchableOpacity
                  key={stamp.id}
                  onPress={addStamp}
                  className="w-12 h-12 rounded-full border-2 border-[#F17922] items-center justify-center bg-white"
                >
                  {stamp.isEarned && (
                    <Image
                      source={stamp.image}
                      className="w-8 h-8"
                      resizeMode="contain"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-white text-xs -mt-2 font-sofia-light">
              Carte valable jusqu'au 31 Avril 2025
            </Text>
          </View>
        </ImageBackground>

        {/* Lien vers les conditions */}
        <TouchableOpacity className="mt-4">
          <Text className="text-center text-sm">
            Lire{" "}
            <Text className="text-[#F17922] text-sofia-light">
              les conditions et les termes
            </Text>{" "}
            de la carte
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Fidelity;
