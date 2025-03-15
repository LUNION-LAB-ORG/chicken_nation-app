import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Trash2 } from "lucide-react-native";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import { StatusBar } from "expo-status-bar";
import { Notification } from "@/types";

// Composant pour les notifications de commande
const OrderNotification: React.FC<{ notification: Notification }> = ({ notification }) => {
  const router = useRouter();
  const orderId = notification.data?.orderId || "";

  // Extraire le montant de la commande du message
  const extractAmount = (message: string) => {
    const match = message.match(/(\d+[\d\s]*\.?\d*)\s*FCFA/);
    return match ? parseInt(match[1].replace(/\s/g, '')) : 0;
  };

  const montantCommande = extractAmount(notification.message);
  const tva = montantCommande * 0.05;
  const netAPayer = montantCommande + tva;

  return (
    <View className="flex-1 px-2">
      {/* Image de la commande */}
      <View>
        <Image
          source={require("@/assets/images/food1.png")}
          className="w-full h-[400px] rounded-3xl -mt-6 py-2"
          resizeMode="contain"
        />
      </View>

      {/* Titre de confirmation */}
      <View className="px-6 -mt-6 mb-6">
        <Text className="text-4xl font-sofia-bold text-orange-500 mb-2">
          Commande réussie
        </Text>
        <Text className="text-base font-sofia-regular text-gray-600 text-xl">
          ID de la réservation <Text className="text-orange-500 text-2xl font-sofia-bold">#{orderId}</Text>
        </Text>
      </View>

      {/* Détails du paiement */}
      <View className="bg-white mx-4 rounded-3xl  p-3 mb-4  ">
        <View className="flex-row justify-between mb-2">
          <Text className="font-sofia-light text-gray-500">
            Montant de la commande
          </Text>
          <Text className="font-sofia-medium text-orange-500">
            {montantCommande.toLocaleString()} FCFA
          </Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="font-sofia-light text-gray-500">TVA 5%</Text>
          <Text className="font-sofia-medium text-orange-500">
            {tva.toLocaleString()} FCFA
          </Text>
        </View>
        <View className="border-t border-gray-200 my-2" />
        <View className="flex-row justify-between mt-2">
          <Text className="font-sofia-light text-gray-500">Net à payer</Text>
          <Text className="font-sofia-bold text-orange-500">
            {netAPayer.toLocaleString()} FCFA
          </Text>

        </View>
         {/* Message d'instruction */}
      <Text className="text-md font-sofia-regular text-gray-500  my-4">
        Ouvre le lien pour suivre l'évolution de ta commande
      </Text>
      </View>

     

      {/* Boutons d'action */}
      <View className="px-4 space-y-3 ">
        <TouchableOpacity 
          onPress={() => router.push("/(authenticated-only)/orders")}
          className="w-full bg-white border border-orange-500 rounded-3xl py-5 items-center mt-14"
        >
          <Text className="text-orange-500 font-sofia-medium text-base">
            Liste des commandes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
      
          className="w-full bg-orange-500 rounded-3xl mt-4 py-5 items-center flex-row justify-center"
        >
          <Image
            source={require("@/assets/icons/external-link.png")}
            className="w-5 h-5 mr-2"
          />
          <Text className="text-white font-sofia-medium text-base">
            Ouvrir le lien
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Composant pour les notifications de promotion
const PromoNotification: React.FC<{ notification: Notification }> = ({ notification }) => {
  return (
    <View className="px-4">
      <View className="bg-orange-50 rounded-xl p-4 mb-4">
        <Text className="text-lg font-sofia-bold text-orange-600 mb-2">
          Offre Spéciale
        </Text>
        <Text className="text-gray-600 font-sofia-regular">
          {notification.message}
        </Text>
      </View>
      
      <View className="bg-white border border-orange-200 rounded-xl p-4">
        <Text className="font-sofia-bold text-gray-900 mb-3">Conditions de l'offre</Text>
        <Text className="font-sofia-regular text-gray-600">
          Valable jusqu'au {notification.date}
        </Text>
      </View>
    </View>
  );
};

// Composant pour les notifications d'information
const InfoNotification: React.FC<{ notification: Notification }> = ({ notification }) => {
  return (
    <View className="px-4">
      <View className="bg-blue-50 rounded-xl p-4">
        <Text className="text-lg font-sofia-bold text-blue-600 mb-2">
          Information importante
        </Text>
        <Text className="text-gray-600 font-sofia-regular">
          {notification.message}
        </Text>
      </View>
    </View>
  );
};

// Composant pour les notifications de paiement
const PaymentNotification: React.FC<{ notification: Notification }> = ({ notification }) => {
  return (
    <View className="px-4">
      <View className="bg-purple-50 rounded-xl p-4 mb-4">
        <Text className="text-lg font-sofia-bold text-purple-600 mb-2">
          Confirmation de paiement
        </Text>
        <Text className="text-gray-600 font-sofia-regular">
          {notification.message}
        </Text>
      </View>

      <View className="bg-white border border-purple-200 rounded-xl p-4">
        <Text className="font-sofia-bold text-gray-900 mb-3">Détails du paiement</Text>
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="font-sofia-regular text-gray-600">Date</Text>
            <Text className="font-sofia-medium text-gray-900">{notification.date}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="font-sofia-regular text-gray-600">Heure</Text>
            <Text className="font-sofia-medium text-gray-900">{notification.time}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// Composant pour les notifications de compte
const AccountNotification: React.FC<{ notification: Notification }> = ({ notification }) => {
  return (
    <View className="px-4">
      <View className="bg-green-50 rounded-xl p-4">
        <Text className="text-lg font-sofia-bold text-green-600 mb-2">
          Mise à jour du compte
        </Text>
        <Text className="text-gray-600 font-sofia-regular">
          {notification.message}
        </Text>
      </View>
    </View>
  );
};

const NotificationDetail = () => {
  const { notificationId, notification: notificationParam } =
    useLocalSearchParams<{
      notificationId: string;
      notification: string;
    }>();
  const [notification, setNotification] = useState<Notification | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (notificationParam) {
      try {
        const parsedNotification = JSON.parse(
          decodeURIComponent(notificationParam),
        );
        setNotification(parsedNotification);
      } catch (error) {
        console.error("Erreur lors du décodage de la notification:", error);
      }
    }
  }, [notificationParam]);

  const handleDelete = () => {
  //  A implementer après 
    router.back();
  };

  if (!notification) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Notification non trouvée</Text>
      </View>
    );
  }

  const renderNotificationContent = () => {
    switch (notification.type) {
      case "order":
        return <OrderNotification notification={notification} />;
      case "promo":
        return <PromoNotification notification={notification} />;
      case "info":
        return <InfoNotification notification={notification} />;
      case "payment":
        return <PaymentNotification notification={notification} />;
      case "account":
        return <AccountNotification notification={notification} />;
      default:
        return <InfoNotification notification={notification} />;
    }
  };

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
        <Text className="text-base font-sofia-medium text-gray-900">
          {notification.title}
        </Text>
        <TouchableOpacity onPress={handleDelete}>
          <Image
            source={require("@/assets/icons/notifications/trash.png")}
            className="w-8 h-8"
          />
        </TouchableOpacity>
      </View>

      {/* Contenu */}
      <ScrollView className="flex-1">
        {/* Image de la notification */}
        {notification.notifBanner && notification.type !== "order" && (
          <View className="px-5 pb-4">
            <Image
              source={notification.notifBanner}
              className="w-full h-[200px] rounded-2xl"
              resizeMode="cover"
            />
          </View>
        )}

        {/* Contenu spécifique au type de notification */}
        {renderNotificationContent()}

        {/* Espace en bas */}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
};

export default NotificationDetail;
