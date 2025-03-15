import React from "react";
import { View, Text, TouchableOpacity, ScrollView,Image } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import { HelpCircle,  Phone, Mail, Globe, ChevronRight } from "lucide-react-native";

const HelpScreen = () => {
  const router = useRouter();

  const faqItems = [
    {
      question: "Comment passer une commande ?",
      icon: <HelpCircle size={24} color="#1C274C" />,
    },
    {
      question: "Comment suivre ma commande ?",
      icon: <HelpCircle size={24} color="#1C274C" />,
    },
    {
      question: "Comment annuler ma commande ?",
      icon: <HelpCircle size={24} color="#1C274C" />,
    },
  ];

  const supportItems = [
  
    {
      title: "Appelez-nous",
      subtitle: "+225 07 07 07 07 07",
      icon: <Phone size={24} color="#1C274C" />,
    },
    {
      title: "Email",
      subtitle: "support@chicken-nation.com",
      icon: <Mail size={24} color="#1C274C" />,
    },
    {
      title: "Site web",
      subtitle: "www.chicken-nation.com",
      icon: <Globe size={24} color="#1C274C" />,
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
          Aide
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* FAQ Section */}
        <View className="mt-6">
          <Text className="text-lg font-sofia-medium text-gray-900 mb-4">
            Questions fréquentes
          </Text>
          <View className="space-y-4">
            {faqItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                className="flex-row items-center justify-between bg-gray-50 p-4 rounded-2xl"
                onPress={() => {}}
              >
                <View className="flex-row items-center">
                  {item.icon}
                  <Text className="ml-3 text-base font-sofia-medium text-gray-900">
                    {item.question}
                  </Text>
                </View>
                <ChevronRight size={20} color="#1C274C" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Support Section */}
        <View className="mt-8">
          <Text className="text-lg font-sofia-medium text-gray-900 mb-4">
            Contactez-nous
          </Text>
          <View className="space-y-4">
            {supportItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                className="flex-row items-center justify-between bg-gray-50 p-4 rounded-2xl"
                onPress={() => {}}
              >
                <View className="flex-row items-center flex-1">
                  {item.icon}
                  <View className="ml-3">
                    <Text className="text-base font-sofia-medium text-gray-900">
                      {item.title}
                    </Text>
                    {item.subtitle && (
                      <Text className="text-sm font-sofia-regular text-gray-500">
                        {item.subtitle}
                      </Text>
                    )}
                  </View>
                </View>
                <ChevronRight size={20} color="#1C274C" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default HelpScreen; 