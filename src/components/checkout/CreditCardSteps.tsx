import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ImageBackground,
} from "react-native";
import GradientButton from "@/components/ui/GradientButton";
import { CreditCardData } from "./types";
import { RecapContent } from "./RecapStep";

 
type AddCreditCardStepProps = {
  creditCardData: CreditCardData;
  onChangeCreditCardData: (data: Partial<CreditCardData>) => void;
  onSave: () => void;
  cardHolderRef: React.RefObject<TextInput>;
  cardNumberRef: React.RefObject<TextInput>;
  expiryDateRef: React.RefObject<TextInput>;
  cvvRef: React.RefObject<TextInput>;
  handleCardNumberChange: (text: string) => void;
  handleExpiryDateChange: (text: string) => void;
  validateCreditCard: () => boolean;
};

export const AddCreditCardStep: React.FC<AddCreditCardStepProps> = ({
  creditCardData,
  onChangeCreditCardData,
  onSave,
  cardHolderRef,
  cardNumberRef,
  expiryDateRef,
  cvvRef,
  handleCardNumberChange,
  handleExpiryDateChange,
  validateCreditCard,
}) => {
 
  return (
    <View className="flex-1 bg-white px-6">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center border-[1px] border-slate-200 rounded-3xl justify-between p-4 mb-6">
          <Image
            source={require("@/assets/icons/payments/visa.png")}
            className="w-12 h-8"
            resizeMode="contain"
          />
          <Text className="font-sofia-medium text-gray-900">
            Carte de crédit prépayé
          </Text>
          <View className="w-8 h-8 rounded-full border-2 border-orange-500 bg-white items-center justify-center">
            <View className="w-5 h-5 rounded-full bg-orange-500" />
          </View>
        </View>
 

        <View className="space-y-4">
          <View className="mb-4">
            <TextInput
              ref={cardHolderRef}
              placeholder="Nom du titulaire de la carte"
              value={creditCardData.cardHolder}
              onChangeText={(text) =>
                onChangeCreditCardData({ cardHolder: text })
              }
              autoCapitalize="words"
              blurOnSubmit={false}
              returnKeyType="next"
              onSubmitEditing={() => cardNumberRef.current?.focus()}
              className="p-5 border border-gray-200 rounded-2xl font-sofia-medium"
            />
          </View>

          <View className="mb-4">
            <TextInput
              ref={cardNumberRef}
              placeholder="Numéro de la carte"
              value={creditCardData.cardNumber}
              onChangeText={handleCardNumberChange}
              keyboardType="numeric"
              maxLength={19}
              blurOnSubmit={false}
              returnKeyType="next"
              onSubmitEditing={() => expiryDateRef.current?.focus()}
              className="p-5 border border-gray-200 rounded-2xl font-sofia-medium"
            />
          </View>

          <View className="mb-4">
            <TextInput
              ref={expiryDateRef}
              placeholder="Date d'expiration"
              value={creditCardData.expiryDate}
              onChangeText={handleExpiryDateChange}
              keyboardType="numeric"
              maxLength={5}
              blurOnSubmit={false}
              returnKeyType="next"
              onSubmitEditing={() => cvvRef.current?.focus()}
              className="p-5 border border-gray-200 rounded-2xl font-sofia-medium"
            />
          </View>

          <View className="mb-4">
            <TextInput
              ref={cvvRef}
              placeholder="CVV"
              value={creditCardData.cvv}
              onChangeText={(text) =>
                onChangeCreditCardData({ cvv: text.slice(0, 3) })
              }
              keyboardType="numeric"
              maxLength={3}
              secureTextEntry
              returnKeyType="done"
              className="p-5 border border-gray-200 rounded-2xl font-sofia-medium"
            />
          </View>
        </View>
      </ScrollView>

      <View className="px-4 py-4 bg-white border-t border-gray-100">
        <TouchableOpacity
          onPress={onSave}
          className={`rounded-2xl py-4 items-center ${
            validateCreditCard() ? "bg-orange-500" : "bg-orange-500/50"
          }`}
          disabled={!validateCreditCard()}
        >
          <Text className="text-white text-lg font-sofia-medium">
            Enregistrer
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

type CreditCardPreviewStepProps = {
  creditCardData: CreditCardData;
  totalAmount: number;
  calculatedTVA: number;
  deliveryFee: number;
  finalTotal: number;
  onContinue: () => void;
};

export const CreditCardPreviewStep: React.FC<CreditCardPreviewStepProps> = ({
  creditCardData,
  totalAmount,
  calculatedTVA,
  deliveryFee,
  finalTotal,
  onContinue,
}) => (
  <View className="flex-1 bg-white">
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* Header avec le titre et l'icône de la carte */}
      <View className="flex-row items-center justify-between p-4 mx-4 mt-4 bg-white rounded-full border border-gray-200">
        <View className="flex-row items-center">
          <Image
            source={require("@/assets/icons/payments/visa.png")}
            className="w-12 h-8"
            resizeMode="contain"
          />
          <Text className="ml-3 font-sofia-medium text-gray-900">
            Carte de crédit prépayé
          </Text>
        </View>
        <View className="w-8 h-8 rounded-full border-2 border-orange-500 bg-white items-center justify-center">
          <View className="w-5 h-5 rounded-full bg-orange-500" />
        </View>
      </View>

      {/* Carte de crédit */}
      <View className="mx-4 rounded-3xl mt-6">
        <ImageBackground
          source={require("@/assets/icons/payments/card-bg.png")}
          className="w-full  overflow-hidden rounded-3xl"
          imageStyle={{ borderRadius: 24 }}
        >
          <View className="flex-1  p-6 px-8">
            {/* Première ligne: Username et Logo Visa */}
            <View className="flex-row items-center justify-between">
              <Text className="text-white text-3xl font-sofia-bold">
                User name
              </Text>
              <Image
                source={require("@/assets/icons/payments/visa-white.png")}
                className="w-20 h-20"
                resizeMode="contain"
              />
            </View>

            {/* Deuxième ligne: Numéro de carte */}
            <Text className="text-white font-sofia-regular text-lg -mt-3 tracking-widest">
              •••• •••• •••• 3629
            </Text>

            {/* Troisième ligne: Section Solde */}
            <View className="mt-10">
              <Text className="text-white text-base font-sofia-light">
                Solde
              </Text>
              <View className="flex-row items-baseline">
                <Text
                  className="text-white font-sofia-bold"
                  style={{ fontSize: 50 }}
                >
                  35,975
                </Text>
                <Text className="text-white text-lg ml-1 mt-2">XOF</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>
    </ScrollView>

    {/* Bouton Valider fixe en bas */}
    <View className="px-4 py-4 bg-white border-t border-gray-100">
      <TouchableOpacity
        onPress={onContinue}
        className="w-full bg-[#F47B0A] rounded-2xl py-4"
      >
        <Text className="text-white text-center text-lg font-sofia-medium">
          Valider
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);
