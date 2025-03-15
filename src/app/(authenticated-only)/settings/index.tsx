import React from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import CustomStatusBar from "@/components/ui/CustomStatusBar";

const Settings = () => {
  const router = useRouter();

  const settingsSections = [
    {
      id: "account",
      title: "Compte",
      icon: require("@/assets/icons/account.png"),
      onPress: () => router.push("/(authenticated-only)/settings/account"),
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: require("@/assets/icons/drawer/notification.png"),
      onPress: () => router.push("/(authenticated-only)/settings/notifications"),
    },
    {
      id: "addresses",
      title: "Adresses enregistrées",
      icon: require("@/assets/icons/map-arrow.png"),
      onPress: () => router.push("/(authenticated-only)/settings/addresses"),
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
            className="w-8 h-8"
          />
        </TouchableOpacity>
        <Text className="text-xl font-sofia-medium text-gray-900">
          Paramètres
        </Text>
        <View className="w-10" />
      </View>

      {/* Liste des paramètres */}
      <ScrollView className="flex-1">
        {settingsSections.map((section, index) => (
          <React.Fragment key={section.id}>
            <TouchableOpacity
              onPress={section.onPress}
              className="flex-row items-center px-6 py-4"
            >
              <Image source={section.icon} className="w-6 h-6" />
              <Text className="ml-4 text-base font-sofia-medium text-gray-900">
                {section.title}
              </Text>
              <Image
                source={require("@/assets/icons/arrow-right.png")}
                className="w-5 h-5 ml-auto"
              />
            </TouchableOpacity>
            {index < settingsSections.length - 1 && (
              <View className="h-[1px] bg-gray-100 mx-6" />
            )}
          </React.Fragment>
        ))}
      </ScrollView>
    </View>
  );
};

export default Settings;
