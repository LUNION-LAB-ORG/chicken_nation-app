import { View } from "react-native";
import React  from "react"; ;
import HomeSearchBar from "@/components/home/HomeSearchBar";
import HomeLocation from "@/components/home/HomeLocation";
import OfferBanner from "@/components/special-offer/OfferBanner";
import Animated, { FadeInDown, FadeIn, Layout } from "react-native-reanimated";
import DynamicHeader from "@/components/home/DynamicHeader";
import CustomStatusBar from "@/components/ui/CustomStatusBar";

const SpecialOffers = () => {
  return (
    <View className="flex-1 bg-white"> 
      <CustomStatusBar />
      <View className="px-4 -mt-2">
     <DynamicHeader
      displayType="logo"
      showCart={true} />
     </View>

 
      <Animated.View entering={FadeIn.duration(800)} className="flex-1">
        {/* Section recherche et localisatio */}
        <Animated.View
          entering={FadeInDown.duration(800).delay(200)}
          layout={Layout.springify()}
          className=" -mt-8 px-6"
        >
          <HomeSearchBar />
          <HomeLocation />
        </Animated.View>

        {/* Section des bannières d'offres */}
        <Animated.View
          entering={FadeInDown.duration(800).delay(400)}
          layout={Layout.springify()}
          className="mt-4 px-6"
        >
          <OfferBanner />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default SpecialOffers;
