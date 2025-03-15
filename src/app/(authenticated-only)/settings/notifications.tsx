import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import CustomRoundedSwitch from "@/components/ui/CustomRoundedSwitch";
import { useAuth } from "@/app/context/AuthContext";
import { users } from "@/data/MockedData";

// Types pour les paramètres de notification
interface NotificationSettingsState {
  specialOffers: boolean;
  promotion: boolean;
  orders: boolean;
  appUpdates: boolean;
  newService: boolean;
}

/**
 * Composant NotificationSettings
 * Gère les préférences de notification de l'utilisateur
 * 
 * @component
 */
const NotificationSettings = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // État initial des notifications
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettingsState>({
    specialOffers: false,
    promotion: false,
    orders: false,
    appUpdates: false,
    newService: false,
  });

  // Charger les préférences de l'utilisateur
  useEffect(() => {
    if (isAuthenticated) {
    
      const currentUser = users[0];
      if (currentUser?.notificationPreferences) {
        setNotificationSettings(currentUser.notificationPreferences);
      }
    }
  }, [isAuthenticated]);

  // Fonction pour basculer l'état d'une notification
  const toggleSwitch = (key: keyof NotificationSettingsState) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Liste des options de notification
  const notificationOptions = [
    {
      id: 'specialOffers',
      title: 'Offres spéciales',
      enabled: notificationSettings.specialOffers,
    },
    {
      id: 'promotion',
      title: 'Promotion',
      enabled: notificationSettings.promotion,
    },
    {
      id: 'orders',
      title: 'Commandes',
      enabled: notificationSettings.orders,
    },
    {
      id: 'appUpdates',
      title: "Mises à jour de l'app",
      enabled: notificationSettings.appUpdates,
    },
    {
      id: 'newService',
      title: 'Nouveau service disponible',
      enabled: notificationSettings.newService,
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
          Notifications
        </Text>
        <View className="w-10" />
      </View>

      {/* Liste des options */}
      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-8 mt-4">
          {notificationOptions.map((option) => (
            <View 
              key={option.id}
              className="flex-row items-center justify-between"
            >
              <Text className="text-base font-sofia-medium text-gray-900">
                {option.title}
              </Text>
              <CustomRoundedSwitch
                value={option.enabled}
                onValueChange={() => toggleSwitch(option.id as keyof NotificationSettingsState)}
              />
            </View>
          ))}
        </View>
        <View className="h-8" />
      </ScrollView>
    </View>
  );
};

export default NotificationSettings; 