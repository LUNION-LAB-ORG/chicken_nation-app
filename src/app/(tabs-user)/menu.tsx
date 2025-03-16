import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import MenuCategory from "@/components/menu/MenuCategory";
import MenuItem from "@/components/menu/MenuItem";
import CategoryList from "@/components/menu/CategoryList";
import HomeLocation from "@/components/home/HomeLocation";
import HomeSearchBar from "@/components/home/HomeSearchBar";
import MenuBanner from "@/components/menu/MenuBanner";
import { menuItems, categories } from "@/data/MockedData";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import { useLocalSearchParams, useRouter } from "expo-router";
import DynamicHeader from "@/components/home/DynamicHeader";
import GradientButton from "@/components/ui/GradientButton";
import useReservationStore from "@/store/reservationStore";
import useDeliveryStore from "@/store/deliveryStore";
import useTakeawayStore from "@/store/takeawayStore";
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInRight,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolate,
  Layout,
  ZoomIn,
  SlideInUp
} from "react-native-reanimated";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const Menu: React.FC = () => {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0].id);

 
  const scrollY = useSharedValue(0);
  const headerScale = useSharedValue(1);
  const buttonsTranslateY = useSharedValue(100);

  const { isActive: isReservationActive, cancelReservation } = useReservationStore();
  const { isActive: isDeliveryActive, currentStep, cancelDelivery } = useDeliveryStore();
  const { isActive: isTakeawayActive } = useTakeawayStore();

  // Scroll handler 
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      headerScale.value = interpolate(
        event.contentOffset.y,
        [0, 100],
        [1, 0.95],
        Extrapolate.CLAMP
      );
    },
  });

  
  const headerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: interpolate(scrollY.value, [0, 100], [1, 0.9], Extrapolate.CLAMP),
  }));

  const bottomButtonsStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(isReservationActive ? 0 : 100, { damping: 15 }) }],
  }));

  useEffect(() => {
    if (isDeliveryActive) {
      cancelReservation();
    }
  }, [isDeliveryActive]);

  useEffect(() => {
    if (isReservationActive) {
      cancelDelivery();
    }
  }, [isReservationActive]);

  useEffect(() => {
    return () => {
      cancelDelivery();
      cancelReservation();
    };
  }, []);

  useEffect(() => {
    if (categoryId) {
      setSelectedCategoryId(categoryId);
    }
  }, [categoryId]);

  const filteredMenuItems = menuItems.filter(
    (item) => item.categoryId === selectedCategoryId,
  );

  const selectedCategory = categories.find(
    (cat) => cat.id === selectedCategoryId,
  );

  const handleCancel = () => {
    cancelDelivery();
    cancelReservation();
    router.back();
  };

  const handleNext = () => {
    router.push("/(common)/products/1");
  };

  return (
    <View className="flex-1 relative bg-white">
      <StatusBar style="dark" />
      <CustomStatusBar />
      
      {/* Header fixe en haut */}
      <View className="px-4 z-10">
        <DynamicHeader
          displayType={isDeliveryActive ? "table" : (isTakeawayActive ? "table" : "logo")}
          title={isDeliveryActive ? "Je veux manger" : (isTakeawayActive ? "A emporter" : "Menu")}
          showCart={true}
        />
      </View>

      <AnimatedScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 100 }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <Animated.View 
          className="px-6 -mt-10"
          entering={FadeInDown.duration(800).springify()}
        >
          <HomeSearchBar />
          <HomeLocation />
          <MenuBanner />

          <Animated.View entering={SlideInRight.duration(800).springify().delay(200)}>
            <CategoryList
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
            />
          </Animated.View>

          {selectedCategory && (
            <Animated.View 
              entering={FadeInUp.duration(600).springify()}
              layout={Layout.springify()}
            >
              <MenuCategory title={selectedCategory.name} />
            </Animated.View>
          )}

          {filteredMenuItems.map((item, index) => (
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
        </Animated.View>
      </AnimatedScrollView>

      {isReservationActive && (
        <Animated.View 
          style={[styles.bottomButtons, bottomButtonsStyle]}
          entering={SlideInUp.duration(500).springify()}
        >
          <AnimatedTouchableOpacity
            onPress={handleCancel}
            style={styles.cancelButton}
            entering={FadeInUp.duration(400).delay(100)}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </AnimatedTouchableOpacity>
          <Animated.View 
            style={{ flex: 1, marginLeft: 8 }}
            entering={FadeInUp.duration(400).delay(200)}
          >
            <GradientButton onPress={handleNext}>
              Suivant
            </GradientButton>
          </Animated.View>
        </Animated.View>
      )}
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

export default Menu;
