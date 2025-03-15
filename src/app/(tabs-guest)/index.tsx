import { View, Text, ScrollView, Image } from "react-native";
import React from "react";
import HomeSearchBar from "@/components/home/HomeSearchBar";
import HomeLocation from "@/components/home/HomeLocation";
import HomeBanner from "@/components/home/HomeBanner";
import CustomStatusBarWithHeader from "@/components/ui/CustomStatusBarWithHeader";
import CategoryCard from "@/components/ui/CategoryCard";

/**
 * Écran d'accueil pour les utilisateurs invités
 * Affiche la bannière d'accueil, la barre de recherche, la localisation et les catégories
 */
const Home: React.FC = () => {
  return (
    <View className="flex-1 relative bg-white">
      {/* Barre d'état personnalisée avec logo */}
      <CustomStatusBarWithHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 50 }}
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <View className="px-6 mt-[20px] ">
            {/* Composants d'en-tête */}
            <HomeSearchBar />
            <HomeLocation />
            <HomeBanner />
          </View>

          {/* Section des catégories */}
          <View className="mt-2">
            <View className="items-center ml-6 flex flex-row gap-2 my-6">
              <Image
                source={require("../../assets/icons/chicken.png")}
                style={{ width: 15, height: 15, resizeMode: "contain" }}
              />
              <Text className="text-lg text-start font-urbanist-medium text-orange-500">
                Ce que nous te proposons
              </Text>
            </View>
            <CategoryCard />
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
};

export default Home;
