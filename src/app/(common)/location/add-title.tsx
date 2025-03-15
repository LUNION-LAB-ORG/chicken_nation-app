import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import { useLocation } from "@/app/context/LocationContext";
import BackButtonTwo from "@/components/ui/BackButtonTwo";

const AddAddressTitle = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [addressTitle, setAddressTitle] = useState("");
  const { setCoordinates, setLocationType, setAddressDetails } = useLocation();

  const handleSaveAddress = async () => {
    const coordinates = params.coordinates ? JSON.parse(params.coordinates as string) : null;
    const formattedAddress = params.formattedAddress as string;

    try {
      if (coordinates) {
        await setCoordinates(coordinates);
      }
      await setLocationType(params.type as "auto" | "manual");
      await setAddressDetails({
        formattedAddress,
        title: addressTitle || "Adresse",
      });
      
      router.push("/(authenticated-only)/settings/addresses");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <CustomStatusBar />

      <View className="px-2 py-4 -mt-14">
        <BackButtonTwo title="Ajouter l'adresse"  />
      </View>

      <View className="flex-1 px-6">
        <View className="items-center mb-8">
          <Image 
            source={require("@/assets/icons/location.png")}
            className="w-32 h-32"
          />
        </View>

        <Text className="text-2xl font-sofia-medium text-center mb-2">
          Nouvelle adresse
        </Text>
        
        <Text className="text-base font-sofia-regular text-gray-500 text-center mb-8">
          {params.formattedAddress}
        </Text>

        <Text className="text-base font-sofia-medium mb-2">
          Donnez un nom à cette adresse
        </Text>
        
        <TextInput
          value={addressTitle}
          onChangeText={setAddressTitle}
          placeholder="Ex: Maison, Bureau, etc."
          className="border border-gray-200 rounded-xl p-4 mb-6"
        />

        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-1 border border-orange-500 rounded-full p-4"
          >
            <Text className="text-orange-500 text-center font-sofia-medium">
              Annuler
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSaveAddress}
            className="flex-1 bg-orange-500 rounded-full p-4"
          >
            <Text className="text-white text-center font-sofia-medium">
              Enregistrer
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default AddAddressTitle; 