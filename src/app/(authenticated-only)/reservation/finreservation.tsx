"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import DynamicHeader from "@/components/home/DynamicHeader";
import GradientButton from "@/components/ui/GradientButton";
import { useRouter } from "expo-router";
import useOrderTypeStore, { OrderType } from "@/store/orderTypeStore";
import useCartStore from "@/store/cartStore";
import { useAuth } from "@/app/context/AuthContext";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Finreservation: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { reservationData, setActiveType } = useOrderTypeStore();
  const { items, totalAmount, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // S'assurer que nous sommes en mode réservation
  useEffect(() => {
    // Activer le type de commande TABLE
    setActiveType(OrderType.TABLE);
  }, []);

  // Calculer les montants
  const subTotal = totalAmount;
  const TVA = subTotal * 0.05;
  const total = subTotal + TVA;

  // Gérer la finalisation de la réservation
  const handleCheckout = () => {
    if (user) {
      try {
        // Définir le type de commande sur TABLE avant de naviguer vers le checkout
        
        setActiveType(OrderType.TABLE);
        
        
        // Ajouter un délai pour s'assurer que le store est mis à jour avant la navigation
        setTimeout(() => {
          // Naviguer vers le checkout avec un paramètre indiquant qu'il s'agit d'une réservation
          router.push({
            pathname: "/(authenticated-only)/checkout",
            params: { type: 'reservation' }
          });
        }, 100);
      } catch (error) {
        console.error("Erreur lors de la préparation des données de réservation:", error);
        
        // Naviguer vers le checkout même en cas d'erreur
        router.push({
          pathname: "/(authenticated-only)/checkout",
          params: { type: 'reservation' }
        });
      }
    } else {
      Alert.alert(
        "Connexion requise",
        "Veuillez vous connecter pour finaliser votre réservation",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Se connecter",
            onPress: () => router.push("/(tabs-guest)/login"),
          },
        ],
      );
    }
  };

  // Gérer le retour en arrière
  const handleBack = () => {
    router.back();
  };

  // Formatage de la date pour l'affichage
  const formatDate = () => {
    if (!reservationData.date) return "Date non spécifiée";

    return new Date(reservationData.date).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <CustomStatusBar />

      {/* En-tête avec titre "Résumé" */}
     <View className="px-4 -mt-2">
     <DynamicHeader
      displayType="summary"
      showCart={true}
      showProgressBar={true}
      progressPercent={100}
      /> 
     </View>  

      <ScrollView>
        <View className="px-6 mt-6">
          {/* Résumé de la réservation */}
          <View className="rounded-2xl mb-6">
            <View className="flex flex-row gap-2 mb-6">
              <Image
                source={require("../../../assets/icons/chicken.png")}
                style={{ width: 18, height: 18, resizeMode: "contain" }}
              />
              <Text className="text-md font-sofia-light text-orange-500 ">
                Date et heure de réservation
              </Text>
            </View>
            {reservationData.fullName && (
              <View className="flex-row justify-between mb-4">
                <Text className="font-sofia-light text-[#9796A1] text-base">
                  Nom complet
                </Text>
                <Text className="font-sofia-medium text-base text-[#595959]">
                  {reservationData.fullName}
                </Text>
              </View>
            )}

            {reservationData.phoneNumber && (
              <View className="flex-row justify-between mb-4">
                <Text className="font-sofia-light text-[#9796A1] text-base">
                  Numéro de téléphone
                </Text>
                <Text className="font-sofia-medium text-base text-[#595959]">
                  {reservationData.phoneNumber}
                </Text>
              </View>
            )}

            <View className="flex-row justify-between mb-4 border-b-[1px] border-dashed border-gray-200 pb-4">
              <Text className="font-sofia-light text-[#9796A1] text-base">
                Email
              </Text>
              <Text className="font-sofia-medium text-base text-[#595959]">
                alex@gmail.com
              </Text>
            </View>

            <View className="flex-row justify-between mb-2">
              <Text className="font-sofia-light text-[#9796A1] text-base">
                Date de réservation
              </Text>
              <Text className="font-sofia-medium text-base text-[#595959]">
                {formatDate()}
              </Text>
            </View>

            <View className="flex-row justify-between mb-2">
              <Text className="font-sofia-light text-[#9796A1] text-base">
                Heure d'arrivée
              </Text>
              <Text className="font-sofia-medium text-base text-[#595959]">
                {reservationData.time || "Non spécifiée"}
              </Text>
            </View>

            <View className="flex-row justify-between mb-2 border-b-2 border-dashed border-slate-200 pb-6">
              <Text className="font-sofia-light text-[#9796A1] text-base">
                Nombre de personnes
              </Text>
              <Text className="font-sofia-medium text-base text-[#595959]">
                {reservationData.numberOfPeople || 0} personnes
              </Text>
            </View>
          </View>

          {/* Résumé de la commande - Section Menu */}
          <View className="flex flex-row gap-2 mb-6 ml-4">
            <Image
              source={require("../../../assets/icons/chicken.png")}
              style={{ width: 18, height: 18, resizeMode: "contain" }}
            />
            <Text className="text-md font-sofia-light text-orange-500">
              Menu
            </Text>
          </View>

          {/* Item de menu avec design correspondant à l'image */}
          <View className="bg-white rounded-2xl mb-6">
            <View className="flex-row gap-3">
              <Image
                className="border-[1px] border-orange-500 mb-4 rounded-3xl"
                source={require("../../../assets/images/food2.png")}
                style={{ width: 115, height: 120, resizeMode: "cover" }}
              />

              <View className="justify-between">
                <Text className="text-2xl font-sofia-medium">
                  CHICKEN DAYS NORMAL
                </Text>
                <Text className="text-xs font-sofia-light text-[#9796A1] ">
                  2 Morceaux de poulet pane + une Salade coleslaw + {`\n`} Une
                  portion de Frite...
                </Text>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="font-sofia-light text-orange-500 text-lg">
                    12.000 FCFA
                  </Text>
                  <View className="flex-row">
                    <TouchableOpacity className="w-10 h-10 rounded-full border border-orange-500 items-center justify-center">
                      <Text className="text-orange-500 text-4xl">-</Text>
                    </TouchableOpacity>
                    <Text className="mx-4 mt-1 font-sofia-light text-xl">
                      01
                    </Text>

                    <TouchableOpacity className="w-10 h-10 rounded-full bg-orange-500 items-center justify-center">
                      <Text className="text-white text-xl">+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            <View className="flex-row mb-6 mt-4">
              <TouchableOpacity className="flex-1 border border-orange-500 rounded-full py-3 mr-2">
                <Text className="text-center text-orange-500 font-sofia-medium">
                  Retirer
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-1 bg-orange-500 rounded-full py-3 ml-2">
                <Text className="text-center text-white font-sofia-medium">
                  Modifier
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Résumé des coûts */}
          <View className="bg-white rounded-3xl p-6 mb-56 border border-orange-500">
            <View className="flex-row justify-between mb-4">
              <Text className="font-sofia-light text-[#9796A1] text-[14px]">
                Montant de la commande
              </Text>
              <Text className="font-sofia-medium text-orange-500 text-[16px]">
                {subTotal.toLocaleString()} FCFA
              </Text>
            </View>

            <View className="flex-row justify-between mb-4">
              <Text className="font-sofia-light text-[#9796A1] text-[14px]">
                TVA 5%
              </Text>
              <Text className="font-sofia-medium text-orange-500 text-[16px]">
                {TVA.toLocaleString()} FCFA
              </Text>
            </View>

            <View className="border-t border-gray-200 my-2" />

            <View className="flex-row justify-between mt-2">
              <Text className="font-sofia-light text-[#9796A1] text-[14px]">
                Net à payer
              </Text>
              <Text className="font-sofia-bold text-orange-500 text-[16px]">
                {total.toLocaleString()} FCFA
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bouton de paiement en bas */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.cancelButton}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelButtonText}>Retour</Text>
        </TouchableOpacity>

        <GradientButton 
          onPress={handleCheckout}
          disabled={isSubmitting}
          className="flex-1 ml-2"
        >
          <View className="flex-row items-center justify-center">
            <Image
              source={require("../../../assets/icons/card.png")}
              style={{
                width: 24,
                height: 24,
                resizeMode: "contain",
                marginRight: 8,
                marginTop: 2,
              }}
            />
            <Text className="text-white text-lg font-sofia-medium">
              Passer à la caisse
            </Text>
          </View>
        </GradientButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomButtons: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#F17922",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
  },
  cancelButtonText: {
    color: "#F17922",
    fontSize: 16,
    fontFamily: "Urbanist-Medium",
  },
});

export default Finreservation;
