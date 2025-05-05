import { View, Text, ScrollView, Image } from "react-native";
import React, { useEffect } from "react";
import HomeSearchBar from "@/components/home/HomeSearchBar";
import HomeLocation from "@/components/home/HomeLocation";
import CustomStatusBarWithHeader from "@/components/ui/CustomStatusBarWithHeader";
import CategoryCard from "@/components/ui/CategoryCard";
import HomeBanner from "@/components/home/HomeBanner";
import DynamicHeader from "@/components/home/DynamicHeader";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import { StatusBar } from "expo-status-bar";
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInRight,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolate
} from "react-native-reanimated";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

import useOrderTypeStore, { OrderType } from "@/store/orderTypeStore";

/**
 * Écran d'accueil pour les utilisateurs invités
 * Affiche la bannière d'accueil, la barre de recherche, la localisation et les catégories
 */
const Home: React.FC = () => {
  // Animation values
  const scrollY = useSharedValue(0);
  const headerScale = useSharedValue(1);

  // Gère le scroll et anime le header
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      headerScale.value = interpolate(
        event.contentOffset.y,
        [0, 100],
        [1, 0.9],
        Extrapolate.CLAMP
      );
    },
  });

  
  const headerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: interpolate(scrollY.value, [0, 100], [1, 0.8], Extrapolate.CLAMP),
  }));

  // Réinitialiser le type de commande à DELIVERY par défaut au chargement de la page d'accueil
  useEffect(() => {
   
    const { resetOrderTypeToDefault } = useOrderTypeStore.getState();
    resetOrderTypeToDefault();
    
  }, []);

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <CustomStatusBar />
      
      {/* Header fixe en haut */}
      <View className="px-4 z-10">
        <DynamicHeader
          displayType="logo"
          showCart={true}
        />
      </View>

      <AnimatedScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 50 }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <AnimatedScrollView
          className="flex-1 -mt-[100px]"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
         
          <Animated.View 
            className="px-6 mt-[20px]"
            entering={FadeInDown.duration(800).springify()}
          >
            <HomeSearchBar />
            <HomeLocation />
            <HomeBanner />
          </Animated.View>

          {/* Section des catégories     */}
          <Animated.View 
            className="mt-2"
            entering={FadeInUp.duration(1000).springify().delay(400)}
          >
            <Animated.View 
              className="items-center ml-6 flex flex-row gap-2 my-6"
              entering={SlideInRight.duration(800).springify().delay(600)}
            >
              <Image
                source={require("../../assets/icons/chicken.png")}
                style={{ width: 15, height: 15, resizeMode: "contain" }}
              />
              <Text className="text-lg text-start font-urbanist-medium text-orange-500">
                Ce que nous te proposons
              </Text>
            </Animated.View>
            <CategoryCard />
          </Animated.View>
        </AnimatedScrollView>
      </AnimatedScrollView>
    </View>
  );
};

export default Home;
