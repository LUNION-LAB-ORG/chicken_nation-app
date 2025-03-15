import { View, Text, Image } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import DynamicHeader from "@/components/home/DynamicHeader";
import GradientButton from "@/components/ui/GradientButton";
import GradientText from "@/components/ui/GradientText";
import { useRouter } from "expo-router";
import useDeliveryStore from "@/store/deliveryStore";

const BeDelivered = () => {
  const router = useRouter();
  const { startDelivery } = useDeliveryStore();

  const handleNext = () => {
    // Démarrer le processus de livraison
    startDelivery();
    // Navigation vers le menu
    router.push("/(tabs-user)/menu");
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <CustomStatusBar />

      <View className=" -mt-6">
        <DynamicHeader
          displayType="back"
          title="Je veux être livré"
        />
      </View>

      <View className="flex-1 items-center justify-between p-4 -mt-20">
        <View className="items-center justify-center flex-1">
          <Image
            source={require("../../../assets/images/etrelivre.png")}
            className="w-80 h-80"
            style={{ resizeMode: "contain" }}
          />
        </View>

        <View className="flex-1 -mt-10">
          <GradientText>Souhaites-tu être livré?</GradientText>
          <Text className="text-start mt-4 font-sofia-light text-[#595959]">
            Choisissez la livraison en quelques clics et profitez de vos plats
            préférés sans bouger de chez vous. Notre équipe de livreurs
            partenaires prend le relais pour vous apporter votre commande dans
            les meilleures conditions. Après avoir sélectionné vos plats,
            indiquez simplement votre adresse de livraison et le créneau horaire
            qui vous convient. Vous pourrez suivre votre commande en temps réel
            sur l'application, de la préparation en cuisine jusqu'à l'arrivée du
            livreur. Nos emballages spéciaux conservent la température et la
            qualité de vos plats pendant le transport. Une notification vous
            préviendra quand le livreur sera en approche de votre domicile.
            Réglez en ligne ou en espèces à la livraison, selon votre
            préférence. Bon appétit !
          </Text>
        </View>

        <GradientButton onPress={handleNext} className="w-full">
          Suivant
        </GradientButton>
      </View>
    </View>
  );
};

export default BeDelivered;
