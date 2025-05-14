import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { PaymentMethod, paymentMethods } from "./types";
import { useAuth } from "@/app/context/AuthContext";
import { AuthStorage } from "@/services/storage/auth-storage";
import { getCustomerDetails } from "@/services/api/customer";

type SuccessStepProps = {
  phoneNumber: string;
  finalTotal: number;
  selectedPayment: PaymentMethod | null;
  onViewOrders: () => void;
  onViewReceipt: () => void;
};

export const SuccessStep: React.FC<SuccessStepProps> = ({
  phoneNumber,
  finalTotal,
  selectedPayment,
  onViewOrders,
  onViewReceipt,
}) => {
  // Récupérer les informations de l'utilisateur connecté
  const { user } = useAuth();
  const [authPhone, setAuthPhone] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  
  // Charger les données client et le numéro de téléphone
  useEffect(() => {
    const loadData = async () => {
      try {
        // Récupérer les données client
        const customerDetails = await getCustomerDetails();
        setCustomerData(customerDetails);
        
        // Récupérer le numéro de téléphone depuis le stockage
        const authData = await AuthStorage.getAuthData();
        if (authData?.phone) {
          setAuthPhone(authData.phone);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };
    
    loadData();
  }, []);
  
  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate().toString().padStart(2, "0")}.${(currentDate.getMonth() + 1).toString().padStart(2, "0")}.${currentDate.getFullYear().toString().slice(2)} - ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
  const reservationId = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  // Formater le nom complet de l'utilisateur en utilisant les données client
  const fullName = customerData 
    ? `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim() 
    : user 
      ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
      : 'Utilisateur';
    
  // Utiliser l'email des données client ou de l'utilisateur
  const email = customerData?.email || user?.email || 'Non renseigné';
  
  // Utiliser le numéro de téléphone dans cet ordre de priorité:
  // 1. Numéro stocké dans AuthStorage
  // 2. Numéro des données client
  // 3. Numéro fourni en prop (saisi pendant le checkout)
  // 4. Valeur par défaut
  const phone = authPhone || customerData?.phone || phoneNumber || 'Non renseigné';

  // Afficher les informations dans la console pour débogage
  useEffect(() => {
    console.log("Données utilisateur dans SuccessStep:", {
      userId: user?.id,
      customerData,
      name: fullName,
      email,
      phoneFromStorage: authPhone,
      phoneFromCustomer: customerData?.phone,
      phoneFromProps: phoneNumber
    });
  }, [user, customerData, phoneNumber, authPhone]);

  return (
    <View className="flex-1 bg-white px-6 pt-8">
      <View className="items-center mb-8">
        <Image
          source={require("@/assets/icons/payments/success.png")}
          className="w-44 h-44"
        />
        <Text className="text-2xl font-sofia-bold text-orange-500">
          Paiement effectué
        </Text>
        <View className="flex-row items-center mt-2">
          <Text className="font-sofia-light text-gray-500">
            ID de la réservation:{" "}
          </Text>
          <Text className="font-sofia-medium text-orange-500">
            #{reservationId}
          </Text>
        </View>
      </View>

      <View className="space-y-6">
        <View className="flex-row justify-between mb-4">
          <Text className="font-sofia-light text-gray-500">Nom complet</Text>
          <Text className="font-sofia-medium">{fullName}</Text>
        </View>

        <View className="flex-row justify-between mb-4">
          <Text className="font-sofia-light text-gray-500">
            Numéro de téléphone
          </Text>
          <Text className="font-sofia-medium">{phone}</Text>
        </View>

        <View className="flex-row justify-between mb-4">
          <Text className="font-sofia-light text-gray-500">Email</Text>
          <Text className="font-sofia-medium">{email}</Text>
        </View>

        <View className="flex-row justify-between mb-4 border-t border-gray-200 pt-4">
          <Text className="font-sofia-light text-gray-500">
            Montant de la commande
          </Text>
          <Text className="font-sofia-medium">
            {finalTotal.toLocaleString()} FCFA
          </Text>
        </View>

        <View className="flex-row justify-between mb-4">
          <Text className="font-sofia-light text-gray-500">Paiement</Text>
          <Text className="font-sofia-medium">
            {paymentMethods.find((m) => m.id === selectedPayment)?.name}
          </Text>
        </View>

        <View className="flex-row justify-between pb-4">
          <Text className="font-sofia-light text-gray-500">
            Date et heure d'opération
          </Text>
          <Text className="font-sofia-medium">{formattedDate}</Text>
        </View>
      </View>

      <Image source={require("@/assets/icons/separator.png")} className="w-full h-2" style={{resizeMode:'contain'}} />

      <View className="items-center mt-8">
        <Text className="font-sofia-light text-xl text-[#9796A1]">
          Bonne appétit
        </Text>
        <Text className="font-sofia-light text-lg text-[#9796A1]0 text-center mt-2">
         Rendez-vous dans les <Text className="text-orange-500 underline">notifications</Text> {`\n`}pour voir le suivie de ta commande
        </Text>
      </View>

      <View className="flex-row gap-4 mt-auto mb-8">
        <TouchableOpacity
          onPress={onViewOrders}
          className="flex-1 border border-orange-500 rounded-full py-4 items-center"
          accessibilityLabel="Voir mes commandes"
        >
          <Text className="text-orange-500 text-center font-sofia-medium text-lg">
            Les commandes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onViewReceipt}
          className="flex-1 bg-orange-500 rounded-full py-4 items-center"
          accessibilityLabel="Voir le reçu"
        >
          <Text className="text-white text-center font-sofia-medium text-lg">
            Reçu
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

type ResultStepProps = {
  onCancel: () => void;
  onRetry: () => void;
};

export const FailedStep: React.FC<ResultStepProps> = ({
  onCancel,
  onRetry,
}) => {
  return (
    <View className="flex-1 bg-white px-6 pt-12">
      <View className="items-center mb-8">
        <Image
          source={require("@/assets/icons/payments/failed.png")}
          className="w-44 h-44"
        />
        <Text className="text-4xl font-sofia-bold text-[#7A3502] mt-4">
          Paiement échoué
        </Text>
        <Text className="font-sofia-light text-gray-500 text-center mt-4 max-w-[280px]">
          Erreur d'opération {`\n`} L'opérateur n'a pas validé votre paiement
        </Text>
      </View>

      <View className="flex-row gap-4 mt-auto mb-8">
        <TouchableOpacity
          onPress={onCancel}
          className="flex-1 border border-orange-500 rounded-3xl py-4"
        >
          <Text className="text-orange-500 text-center font-sofia-medium text-lg">
            Annuler
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onRetry}
          className="flex-1 bg-orange-500 rounded-3xl py-4"
        >
          <Text className="text-white text-center font-sofia-medium text-lg">
            Réessayer
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const NetworkErrorStep: React.FC<ResultStepProps> = ({
  onCancel,
  onRetry,
}) => {
  return (
    <View className="flex-1 bg-white px-6 pt-8">
      <View className="items-center mb-8">
        <Image
          source={require("@/assets/icons/payments/network.png")}
          style={{ resizeMode: "contain" }}
          className="w-44 h-44 mt-32"
        />
      </View>

      <View className="flex-row gap-4 mt-auto mb-8">
        <TouchableOpacity
          onPress={onCancel}
          className="flex-1 border border-orange-500 rounded-3xl py-4"
        >
          <Text className="text-orange-500 text-center font-sofia-medium text-lg">
            Annuler
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onRetry}
          className="flex-1 bg-orange-500 rounded-3xl py-4"
        >
          <Text className="text-white text-center font-sofia-medium text-lg">
            Réessayer
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
