import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import {   Share2, Copy, Users, Gift } from "lucide-react-native";
import GradientButton from "@/components/ui/GradientButton";

const InviteScreen = () => {
  const router = useRouter();
  const inviteCode = "CHICKEN2025";

  const shareOptions = [
    {
      title: "Partager le lien",
      description: "Envoyez votre lien d'invitation à vos amis",
      icon: <Share2 size={24} color="#1C274C" />,
      onPress: () => {},
    },
    {
      title: "Code d'invitation",
      description: inviteCode,
      icon: <Copy size={24} color="#1C274C" />,
      onPress: () => {},
    },
  ];

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <CustomStatusBar />

      {/* Header */}
      <View className="flex-row items-center justify-between px-3 pb-4">
      <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require("@/assets/icons/arrow-back.png")}
            className="w-10 h-10"
          />
        </TouchableOpacity>
        <Text className="text-xl font-sofia-medium text-gray-900">
          Inviter des amis
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Section Hero */}
        <View className="items-center mt-8">
        <Image
            source={require("@/assets/icons/shared.png")}
            className="w-44 h-44"
          />
          <Text className="text-2xl font-sofia-bold text-gray-900 mt-6 text-center">
            Invitez vos amis
          </Text>
          <Text className="text-base font-sofia-regular text-gray-500 mt-2 text-center">
            Partagez l'application avec vos amis et gagnez des récompenses
          </Text>
        </View>
 
        <View className="bg-orange-50 rounded-2xl p-6 mt-8">
          <View className="flex-row items-center">
            <Gift size={24} color="#F97316" />
            <Text className="ml-2 text-lg font-sofia-medium text-gray-900">
              Récompenses
            </Text>
          </View>
          <Text className="mt-2 text-base font-sofia-regular text-gray-600">
            Gagnez 1000 FCFA pour chaque ami qui s'inscrit avec votre code et passe sa première commande
          </Text>
        </View>

        {/* Share Options */}
        <View className="mt-8 space-y-4">
          {shareOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              className="flex-row items-center justify-between bg-gray-50 p-4 rounded-2xl"
              onPress={option.onPress}
            >
              <View className="flex-row items-center flex-1">
                {option.icon}
                <View className="ml-3">
                  <Text className="text-base font-sofia-medium text-gray-900">
                    {option.title}
                  </Text>
                  <Text className="text-sm font-sofia-regular text-gray-500">
                    {option.description}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* bouton partager */}
        <View className="mt-8 mb-6">
          <GradientButton onPress={() => {}}>
            <View className="flex-row items-center justify-center">
              <Share2 size={20} color="white" className="mr-2" />
              <Text className="text-white ml-4 text-lg font-sofia-medium">
                Partager maintenant
              </Text>
            </View>
          </GradientButton>
        </View>
      </ScrollView>
    </View>
  );
};

export default InviteScreen; 