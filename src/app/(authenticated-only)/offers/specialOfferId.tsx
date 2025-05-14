import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import DynamicHeader from "@/components/home/DynamicHeader";
import { promoBanners } from "@/data/MockedData";
import { FontAwesome } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeInLeft,
  SlideInDown,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
  Layout,
  ZoomIn,
} from "react-native-reanimated";
import useCartStore from "@/store/cartStore";
import MenuItem from "@/components/menu/MenuItem";
import { getAllMenus } from "@/services/menuService";
import { MenuItem as MenuItemType } from "@/types";

const screenWidth = Dimensions.get("window").width;

const fadeInConfig = {
  damping: 20,
  mass: 0.8,
  stiffness: 100,
  duration: 800,
};

const SpecialOfferDetailScreen: React.FC = () => {
  const { specialId } = useLocalSearchParams<{ specialId: string }>();
  const [offerMenus, setOfferMenus] = useState<MenuItemType[]>([]);
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const bannerScale = useSharedValue(0.95);
  const bannerOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(20);

  // Récupération des méthodes du panier
  const { addToCart } = useCartStore();

  useEffect(() => {
    // Animation de la bannière
    bannerScale.value = withSpring(1, {
      damping: 15,
      stiffness: 100,
      mass: 0.8,
    });

    bannerOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    contentTranslateY.value = withSpring(0, {
      damping: 20,
      stiffness: 100,
      mass: 0.8,
    });

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (specialId) {
          const currentOffer = promoBanners.find(
            (banner) => banner.offerId === specialId,
          );
          
          if (currentOffer) {
            setOffer(currentOffer);
            
            // Récupérer tous les menus
            const menuData = await getAllMenus();
            
            if (menuData && menuData.length > 0) {
              // Filtrer les menus par les IDs associés à l'offre
              const associatedMenus = menuData.filter((menu) => 
                currentOffer.menuIds.includes(menu.id)
              );
              setOfferMenus(associatedMenus);
            } else {
              setError("Aucun menu disponible pour cette offre");
            }
          } else {
            setError("Offre non trouvée");
          }
        }
      } catch (err) {
        setError(`Erreur lors du chargement des données: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [specialId]);

  const bannerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: bannerScale.value },
        {
          translateY: interpolate(
            bannerOpacity.value,
            [0, 1],
            [10, 0],
            Extrapolate.CLAMP,
          ),
        },
      ] as any,
      opacity: bannerOpacity.value,
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: contentTranslateY.value }] as any,
      opacity: interpolate(
        contentTranslateY.value,
        [20, 0],
        [0, 1],
        Extrapolate.CLAMP,
      ),
    };
  });

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <StatusBar style="dark" />
        <CustomStatusBar />
        <Text className="text-gray-600 font-urbanist-medium">Chargement...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-4">
        <StatusBar style="dark" />
        <CustomStatusBar />
        <Text className="text-red-500 font-urbanist-bold text-lg mb-2">Erreur</Text>
        <Text className="text-gray-600 font-urbanist-medium text-center">{error}</Text>
        <TouchableOpacity 
          className="mt-6 bg-orange-500 py-3 px-6 rounded-full"
          onPress={() => router.back()}
        >
          <Text className="text-white font-urbanist-bold">Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!offer) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text>Offre spéciale non trouvée (ID: {specialId})</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <CustomStatusBar />

      <Animated.View entering={FadeInDown.duration(500)} className="-mt-6">
        <DynamicHeader
          displayType="back"
          title="Offres spéciales"
          showCart={true}
        />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-6 py-4">
          {/* Bannière de l'offre */}
          <Animated.View
            style={[bannerAnimatedStyle]}
            className="relative mb-8"
          >
            <ImageBackground
              source={offer.background}
              className="w-full rounded-3xl overflow-hidden flex-row items-center justify-between"
              style={{ height: screenWidth * 0.42 }}
            >
              <View className="w-1/2 pl-9">
                <Text
                  className="text-white font-blocklyn-grunge leading-none pt-5"
                  style={{ fontSize: screenWidth * 0.17 }}
                >
                  {offer.percentText}
                </Text>
                <Text
                  className="text-white font-blocklyn-grunge -mt-1 leading-tight"
                  style={{ fontSize: screenWidth * 0.038 }}
                >
                  {offer.mainText}
                </Text>
                <Text
                  className="text-white font-sofia-regular leading-tight"
                  style={{ fontSize: screenWidth * 0.028 }}
                >
                  {offer.subText}
                </Text>
              </View>

              <View className="w-1/2 h-full relative">
                <Image
                  source={offer.image}
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
          </Animated.View>

          {/* Liste des menus */}
          <Animated.View style={contentAnimatedStyle}>
            {offerMenus.length > 0 ? (
              <View>
                {offerMenus.map((item, index) => (
                  <Animated.View
                    key={item.id}
                    entering={ZoomIn.duration(400).delay(index * 100)}
                    layout={Layout.springify()}
                  >
                    <MenuItem
                      id={item.id}
                      name={item.name}
                      price={`${item.price} FCFA`}
                      image={item.image}
                      isNew={item.isNew ? "NOUVEAU" : undefined}
                      description={item.description}
                    />
                  </Animated.View>
                ))}
              </View>
            ) : (
              <View className="py-4">
                <Text className="text-center text-gray-500">
                  Aucun menu disponible pour cette offre
                </Text>
              </View>
            )}
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SpecialOfferDetailScreen;
