import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import GradientButton from "@/components/ui/GradientButton";
import { MapPin, Edit2 } from "lucide-react-native";
import { getUserAddresses } from "@/services/api/address";

interface Address {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

const AddressSettings = () => {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
 
  // Charger les adresses de l'utilisateur depuis l'API
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const apiAddresses = await getUserAddresses();
        
        if (!apiAddresses || apiAddresses.length === 0) {
          setAddresses([]);
          return;
        }
        
        // Convertir le format API en format local sans modifier la structure
        const formattedAddresses: Address[] = apiAddresses.map(addr => ({
          id: String(addr.id || Math.random().toString(36).substring(2, 9)),
          name: addr.title,
          address: addr.address,
          coordinates: {
            latitude: addr.latitude,
            longitude: addr.longitude
          }
        }));
        
        setAddresses(formattedAddresses);
      } catch (error) {
        // En cas d'erreur, utiliser les données mockées comme fallback
        setAddresses([
          {
            id: "1",
            name: "Chez moi",
            address: "Times Square NYC, Manhattan, 27",
            coordinates: {
              latitude: 40.7580,
              longitude: -73.9855,
            }
          },
          {
            id: "2",
            name: "Bureau",
            address: "5259 Blue Bill Park, PC 4627",
            coordinates: {
              latitude: 40.7829,
              longitude: -73.9654,
            }
          },
          {
            id: "3",
            name: "Liberté",
            address: "61480 Sunbrook Park, PC 5679",
            coordinates: {
              latitude: 40.7421,
              longitude: -73.9890,
            }
          },
          {
            id: "4",
            name: "Chez Patrick",
            address: "6993 Meadow Valley Terra, PC 36",
            coordinates: {
              latitude: 40.7589,
              longitude: -73.9851,
            }
          },
        ]);
      }
    };

    loadAddresses();
  }, []);

  const handleEditAddress = (address: Address) => {
    console.log("Édition de l'adresse:", JSON.stringify(address, null, 2));
    router.push({
      pathname: "/location/edit-address",
      params: { 
        id: address.id,
        title: address.name,
        address: address.address,
        latitude: String(address.coordinates.latitude),
        longitude: String(address.coordinates.longitude)
      }
    });
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
        <Text className="text-xl font-sofia-medium text-gray-900">
          Adresses enregistrées
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6">
        {addresses.length === 0 ? (
          <View className="items-center justify-center mt-4">
            <Text className="text-base font-sofia-regular text-gray-500 text-center">
              Aucune adresse enregistrée
            </Text>
          </View>
        ) : (
          addresses.map((address, index) => (
            <View 
              key={address.id}
              className='flex-row items-center justify-between py-4' 
            >
              <View className="flex-row items-center flex-1">
                <View className="-ml-2 ">
                  <Image source={require('../../../assets/icons/changelocation.png')} style={{width: 56, height: 56, resizeMode: "contain"}} />
                 </View>
                <View className="ml-3 flex-1">
                  <Text className="text-base font-sofia-medium text-orange-500">
                    {address.name}
                  </Text>
                  <Text className="text-sm font-sofia-regular text-gray-500 mt-1">
                    {address.address}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                className=""
                onPress={() => handleEditAddress(address)}
              >
                 <Image source={require('../../../assets/icons/edit.png')} style={{width: 30, height: 30, resizeMode: "contain"}} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Bouton ajouteer une nouvelle adresse  */}
      <View className="px-6 py-4">
        <GradientButton onPress={() => router.push("/(common)/location")}>
          <Text className="text-white text-base font-sofia-medium">
            Créer une nouvelle adresse
          </Text>
        </GradientButton>
      </View>
    </View>
  );
};

export default AddressSettings;