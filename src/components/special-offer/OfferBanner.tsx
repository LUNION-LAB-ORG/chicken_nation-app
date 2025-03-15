import React from "react";
import {
  View,
  Text,
  Image,
  ImageBackground,
  useWindowDimensions,
  TouchableOpacity,
  ScrollView
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/app/context/AuthContext";
import { promoBanners } from "@/data/MockedData"; 

const OfferBanner: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { width: screenWidth } = useWindowDimensions();
  const bannerHeight = screenWidth * 0.42;

  const handleBannerPress = (specialId: string) => {
    if (!user) {
      router.push("/(tabs-guest)/login");
      return;
    }

    router.push({
      pathname: "/(authenticated-only)/offers/specialOfferId",
      params: { specialId },
    });
  };

  return (
    <View className="my-2 space-y-4">
      <View className="items-center -mt-6 ml-1 mb-6 flex flex-row gap-2 ">
        <Image
          source={require("../../assets/icons/chicken.png")}
          style={{ width: 15, height: 15, resizeMode: "contain" }}
        />
        <Text className="text-lg text-start font-urbanist-medium text-orange-500">
          Offre spéciale
        </Text>
      </View>
     <ScrollView showsVerticalScrollIndicator={false}>
     {promoBanners.map((banner) => (
        <TouchableOpacity
          key={banner.id}
          onPress={() => handleBannerPress(banner.offerId)}
          activeOpacity={0.9}
          accessibilityLabel={`Offre promotionnelle: ${banner.mainText}`}
        >
          <ImageBackground
            source={banner.background}
            className="w-full rounded-3xl overflow-hidden flex-row items-center justify-between mb-6"
            style={{ height: bannerHeight }}
          >
            {/* Contenu texte */}
            <View className="w-1/2 pl-9">
              <Text
                className="text-white font-blocklyn-grunge leading-none pt-5"
                style={{ fontSize: screenWidth * 0.17 }}
              >
                {banner.percentText}
              </Text>
              <Text
                className="text-white font-blocklyn-grunge -mt-1 leading-tight"
                style={{ fontSize: screenWidth * 0.038 }}
              >
                {banner.mainText}
              </Text>
              <Text
                className="text-white font-sofia-regular leading-tight"
                style={{ fontSize: screenWidth * 0.028 }}
              >
                {banner.subText}
              </Text>
            </View>

            {/* Image du produit */}
            <View className="w-1/2 h-full relative">
              <Image
                source={banner.image}
                resizeMode="contain"
                style={{
                  position: "absolute",
                  width: screenWidth * 0.45,
                  height: screenWidth * 0.45 * 1.16,
                  right: -5,
                  bottom: -35,
                }}
              />
            </View>
          </ImageBackground>
        </TouchableOpacity>
      ))}
     </ScrollView>
    </View>
  );
};

export default OfferBanner;
