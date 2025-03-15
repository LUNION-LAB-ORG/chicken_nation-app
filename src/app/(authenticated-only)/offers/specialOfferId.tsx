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
import { promoBanners, menuItems } from "@/data/MockedData";
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
} from "react-native-reanimated";
import useCartStore from "@/store/cartStore";

const screenWidth = Dimensions.get("window").width;

 
const fadeInConfig = {
  damping: 20,
  mass: 0.8,
  stiffness: 100,
  duration: 800,
};

const SpecialOfferDetailScreen: React.FC = () => {
  const { specialId } = useLocalSearchParams<{ specialId: string }>();
  type ExtendedMenuItem = (typeof menuItems)[0] & {
    originalPrice: string;
    discountedPrice: string;
  };
  const [offerMenus, setOfferMenus] = useState<ExtendedMenuItem[]>([]);
  const [offer, setOffer] = useState<any>(null);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  // Animation values
  const bannerScale = useSharedValue(0.95);
  const bannerOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(20);

  // Récupération des méthodes du panier
  const { addToCart, updateQuantity, decrementItem } = useCartStore();

  useEffect(() => {
    // Animation  de la bannière
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

    if (specialId) {
      const currentOffer = promoBanners.find(
        (banner) => banner.offerId === specialId,
      );
      if (currentOffer) {
        setOffer(currentOffer);
        // Filtrer les menus par les IDs associés à l'offre
        const associatedMenus = menuItems
          .filter((menu) => currentOffer.menuIds.includes(menu.id))
          .map((menu) => ({
            ...menu,
            originalPrice: currentOffer.promoDetails.originalPrices[menu.id],
            discountedPrice: calculateDiscountedPrice(
              currentOffer.promoDetails.originalPrices[menu.id],
              currentOffer.promoDetails.discount,
            ),
          }));
        setOfferMenus(associatedMenus as ExtendedMenuItem[]);
      }
    }
  }, [specialId]);

  const calculateDiscountedPrice = (
    originalPrice: string,
    discount: number,
  ): string => {
    const price = parseInt(originalPrice);
    const discounted = price - (price * discount) / 100;
    return discounted.toString();
  };

 
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

  const handleIncrement = (menuItem: any) => {
    setQuantities((prev) => ({
      ...prev,
      [menuItem.id]: (prev[menuItem.id] || 0) + 1,
    }));

    // Créer l'item pour le panier avec le prix réduit
    const cartItem = {
      id: menuItem.id,
      name: menuItem.name,
      discountedPrice: parseInt(menuItem.discountedPrice),
      quantity: 1,
      image: menuItem.image,
      price: menuItem.originalPrice,
      discount: offer.promoDetails.discount,
      extras: [],
    };

    addToCart(cartItem);
  };

  const handleDecrement = (menuItem: any) => {
    if (quantities[menuItem.id] > 0) {
      setQuantities((prev) => ({
        ...prev,
        [menuItem.id]: Math.max((prev[menuItem.id] || 0) - 1, 0),
      }));
      decrementItem(menuItem.id);
    }
  };

  const handleMenuPress = (menu: any) => {
    router.push({
      pathname: "/(common)/products/[productId]",
      params: {
        productId: menu.id,
        offerId: specialId,
        discount: offer.promoDetails.discount,
        originalPrice: menu.originalPrice,
        discountedPrice: menu.discountedPrice,
      },
    });
  };

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
          {/* Bannière de l'offre   */}
          <Animated.View
            style={[bannerAnimatedStyle]}
            className="relative mb-8"
          >
            <ImageBackground
              source={offer.background}
              className="w-full rounded-3xl overflow-hidden flex-row items-center justify-between"
              style={{ height: screenWidth * 0.42 }} // Même ratio que MenuBanner
            >
              {/* Contenu texte */}
              <View className="w-1/2 pl-9">
                <Text
                  className="text-white font-blocklyn-grunge leading-none pt-5"
                  style={{ fontSize: screenWidth * 0.17 }}
                  accessibilityLabel={offer.percentText}
                >
                  {offer.percentText}
                </Text>
                <Text
                  className="text-white font-blocklyn-grunge -mt-1 leading-tight"
                  style={{ fontSize: screenWidth * 0.038 }}
                  accessibilityLabel={offer.mainText}
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

              {/* Image du produit */}
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
                  accessibilityLabel={`Image pour ${offer.mainText}`}
                />
              </View>
            </ImageBackground>
          </Animated.View>

          {/* Contenu animé */}
          <Animated.View style={contentAnimatedStyle}>
            {/* Liste des menus de l'offre */}
            {offerMenus.length > 0 ? (
              <View>
                {offerMenus.map((item, index) => (
                  <Animated.View
                    key={item.id}
                    entering={SlideInDown.delay(200 * index)}
                  >
                    <TouchableOpacity
                      onPress={() => handleMenuPress(item)}
                      className="flex-row items-center p-4 border-b border-gray-100"
                    >
                      <Image
                        source={item.image}
                        className="w-[100px] h-[100px] rounded-3xl border-[1px] border-slate-100"
                      />
                      <View className="ml-4 flex-1">
                        <Text className="text-lg font-sofia-medium mb-1">
                          {item.name}
                        </Text>
                        {item.description && (
                          <Text className="text-sm text-gray-500 font-sofia-light mb-1">
                            {item.description}
                          </Text>
                        )}
                        <View className="flex-row items-center justify-between">
                          <View>
                            <Text className="text-lg font-urbanist-regular text-orange-500">
                              {item.originalPrice} FCFA
                            </Text>
                          </View>
                          <View className="flex-row items-center mt-2">
                            <TouchableOpacity
                              className="border-orange-500 border-2 rounded-full p-[9px] py-[7px]"
                              onPress={(e) => {
                                e.stopPropagation();
                                handleDecrement(item);
                              }}
                            >
                              <FontAwesome
                                name="minus"
                                size={18}
                                color="#f97316"
                              />
                            </TouchableOpacity>
                            <Text className="mx-4 text-lg font-sofia-light text-black/70">
                              {quantities[item.id] || 0}
                            </Text>
                            <TouchableOpacity
                              onPress={(e) => {
                                e.stopPropagation();
                                handleIncrement(item);
                              }}
                            >
                              <Image
                                source={require("../../../assets/icons/plus-rounded.png")}
                                style={{
                                  width: 38,
                                  height: 38,
                                  resizeMode: "contain",
                                }}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
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
