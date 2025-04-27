import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import MenuCategory from "@/components/menu/MenuCategory";
import MenuItem from "@/components/menu/MenuItem";
import CategoryList from "@/components/menu/CategoryList";
import HomeLocation from "@/components/home/HomeLocation";
import HomeSearchBar from "@/components/home/HomeSearchBar";
import MenuBanner from "@/components/menu/MenuBanner";
import { getAllMenus } from "@/services/menuService";
import { getAllCategories } from "@/services/categoryService";
import { MenuItem as MenuItemType, Category } from "@/types";
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
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const scrollY = useSharedValue(0);
  const headerScale = useSharedValue(1);
  const buttonsTranslateY = useSharedValue(100);

  const { isActive: isReservationActive, cancelReservation } = useReservationStore();
  const { isActive: isDeliveryActive, currentStep, cancelDelivery } = useDeliveryStore();
  const { isActive: isTakeawayActive } = useTakeawayStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Récupérer les catégories
        let categoriesData;
        try {
          categoriesData = await getAllCategories();
          
          if (!categoriesData || categoriesData.length === 0) {
            setError("Aucune catégorie disponible pour le moment.");
          } else {
            setCategories(categoriesData);
            
            // Sélectionner la première catégorie par défaut
            if (categoriesData.length > 0 && !selectedCategoryId) {
              setSelectedCategoryId(categoriesData[0].id);
            }
          }
        } catch (catError) {
          setError("Impossible de charger les catégories. Veuillez réessayer plus tard.");
          categoriesData = [];
        }
        
        // Récupérer les menus
        let menuData;
        try {
          menuData = await getAllMenus();
          
          if (menuData && menuData.length > 0) {
            setMenuItems(menuData);
            
            // Si nous avons des menus mais pas de catégories, afficher un message d'erreur
            if (!categoriesData || categoriesData.length === 0) {
              setError("Les catégories ne sont pas disponibles pour le moment.");
            }
          } else {
            setError("Aucun menu disponible pour le moment.");
          }
        } catch (menuError) {
          setError("Impossible de charger les menus. Veuillez réessayer plus tard.");
        }
        
      } catch (err) {
        setError(`Impossible de charger les données: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

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
    if (categoryId && categories.length > 0) {
      setSelectedCategoryId(categoryId);
    }
  }, [categoryId, categories]);

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

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <StatusBar style="dark" />
        <CustomStatusBar />
        <ActivityIndicator size="large" color="#F97316" />
        <Text className="mt-4 text-gray-600 font-urbanist-medium">Chargement du menu...</Text>
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

  if (categories.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-4">
        <StatusBar style="dark" />
        <CustomStatusBar />
        <Text className="text-gray-600 font-urbanist-medium text-center">Aucune catégorie disponible pour le moment.</Text>
        <TouchableOpacity 
          className="mt-6 bg-orange-500 py-3 px-6 rounded-full"
          onPress={() => router.back()}
        >
          <Text className="text-white font-urbanist-bold">Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 relative bg-white">
      <StatusBar style="dark" />
      <CustomStatusBar />
      
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

          {filteredMenuItems.length > 0 ? (
            filteredMenuItems.map((item, index) => (
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
            ))
          ) : (
            <Text className="text-gray-500 text-center py-8 font-urbanist-medium">
              Aucun plat disponible dans cette catégorie
            </Text>
          )}
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
            <GradientButton 
              onPress={handleNext}
              text="Continuer"
            />
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
    bottom: 20,
    left: 20,
    right: 20,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "white",
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#F97316",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#F97316",
    fontFamily: "Urbanist-Bold",
    fontSize: 16,
  },
});

export default Menu;
