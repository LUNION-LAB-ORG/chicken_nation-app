import { View, Text, Image } from "react-native";
import React from "react";
import BackButton from "@/components/ui/BackButton";
import { StatusBar } from "expo-status-bar";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import BackButtonTwo from "@/components/ui/BackButtonTwo";
import GradientButton from "@/components/ui/GradientButton";
import GradientText from "@/components/ui/GradientText";
import { router } from "expo-router";

const ReservationScreen = () => {
  return (
    <View className="flex-1 bg-white p-4">
      <StatusBar style="dark" />
      <View className="absolute top-0 left-0 right-0 z-50">
        <CustomStatusBar />
      </View>

      <View className="py-2 pb-4  ">
        <BackButtonTwo title="Je veux réserver" />
      </View>

      <View className="flex-1 items-center justify-between p-4 -mt-20">
        <View className="items-center justify-center flex-1">
          <Image
            source={require("../../../assets/images/reservation.png")}
            className="w-80 h-80"
            style={{ resizeMode: "contain" }}
          />
        </View>

        <View className="flex-1 -mt-10">
          <GradientText>Veux-tu réserver une table ?</GradientText>
          <Text className="text-start mt-4 font-sofia-light text-[#595959]">
            Réservez votre table en quelques instants et assurez-vous une place
            dans notre restaurant. Notre système de réservation simple vous
            permet de choisir la date, l'heure et le nombre de convives selon
            vos préférences. Sélectionnez d'abord le créneau qui vous convient
            dans notre calendrier interactif. Vous pouvez visualiser les
            disponibilités en temps réel et choisir l'emplacement idéal selon
            l'ambiance recherchée. Une fois votre réservation confirmée, vous
            recevrez un message de confirmation avec un numéro de réservation.
            Nous vous enverrons également un rappel quelques heures avant votre
            arrivée. À votre arrivée au restaurant, mentionnez simplement votre
            nom ou présentez votre numéro de réservation à notre hôte d'accueil
            qui vous conduira directement à votre table préparée.
          </Text>
        </View>

        <GradientButton
          onPress={() =>
            router.push("/(authenticated-only)/reservation/reserver")
          }
          className="w-full"
        >
          Suivant
        </GradientButton>
      </View>
    </View>
  );
};

export default ReservationScreen;
