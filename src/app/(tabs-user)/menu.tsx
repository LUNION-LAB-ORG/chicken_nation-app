import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
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
import useOrderTypeStore, { OrderType } from "@/store/orderTypeStore";
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
  const params = useLocalSearchParams();
  const categoryId = typeof params.categoryId === 'string' ? params.categoryId : undefined;
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const headerScale = useSharedValue(1);
  const buttonsTranslateY = useSharedValue(100);

  const { activeType, setActiveType } = useOrderTypeStore();
  const { isActive: isReservationActive, cancelReservation } = useReservationStore();
  const { isActive: isDeliveryActive, currentStep, cancelDelivery } = useDeliveryStore();
  const { isActive: isTakeawayActive } = useTakeawayStore();

  const hasInitializedRef = useRef(false);

  useEffect(() => {
    const initializeMenu = async () => {
      if (hasInitializedRef.current) return;
      hasInitializedRef.current = true;
 
      
      // Vérifier si un paramètre de type est spécifié
      const hasTypeParam = params.type === 'pickup' || params.type === 'delivery' || params.type === 'reservation';
      
      // Si un paramètre de type est spécifié, l'utiliser pour définir le type de commande
      if (hasTypeParam) {
        if (params.type === 'pickup') {
          console.log("Mode pickup détecté depuis les paramètres de route");
          setActiveType(OrderType.PICKUP);
        } else if (params.type === 'delivery') {
          console.log("Mode delivery détecté depuis les paramètres de route");
          setActiveType(OrderType.DELIVERY);
        } else if (params.type === 'reservation') {
          console.log("Mode réservation détecté depuis les paramètres de route");
          setActiveType(OrderType.TABLE);
        }
      } else {
        // Si aucun paramètre de type n'est spécifié, vérifier si le type actuel est valide
        const isValidType = activeType === OrderType.DELIVERY || 
                            activeType === OrderType.PICKUP || 
                            activeType === OrderType.TABLE;
        
        // Ne réinitialiser à DELIVERY que si le type actuel n'est pas valide
        if (!isValidType) {
          console.log("Aucun type valide détecté, réinitialisation à DELIVERY");
          useOrderTypeStore.getState().resetOrderTypeToDefault();
          setActiveType(OrderType.DELIVERY);
        } else {
          console.log(`Type de commande actuel valide: ${activeType}, conservation de ce type`);
        }
      }
      
      // Vérifier à nouveau le type actif après la mise à jour
      setTimeout(() => {
        console.log("Type de commande après initialisation du menu:", useOrderTypeStore.getState().activeType);
      }, 100);
    };

    initializeMenu();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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
            if (categoriesData.length > 0 && !selectedCategory) {
              setSelectedCategory(categoriesData[0].id);
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
          setMenuItems(menuData || []);
        } catch (menuError) {
          setError("Impossible de charger les menus. Veuillez réessayer plus tard.");
          setMenuItems([]);
        }
        
      } catch (err) {
        setError(`Impossible de charger les données: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
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
    opacity: interpolate(headerScale.value, [0.95, 1], [0.9, 1], Extrapolate.CLAMP),
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
      setSelectedCategory(categoryId);
    }
  }, [categoryId, categories]);

  const filteredMenuItems = menuItems.filter(
    (item) => item.categoryId === selectedCategory,
  );

  const selectedCategoryData = categories.find(
    (cat) => cat.id === selectedCategory,
  );

  const handleCancel = () => {
    cancelDelivery();
    cancelReservation();
    router.back();
  };

  const handleNext = () => {
    router.push("/(common)/products/1");
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <StatusBar style="dark" />
        <CustomStatusBar />
        <ActivityIndicator size="large" color="#F97316" />
        <Text className="mt-4 text-gray-600 font-urbanist-medium">Chargement du menu...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 relative bg-white">
      <StatusBar style="dark" />
      <CustomStatusBar />
      
      <View className="px-4 z-10">
        <DynamicHeader
          displayType={activeType === OrderType.DELIVERY ? "table" : (activeType === OrderType.PICKUP ? "table" : "logo")}
          title={activeType === OrderType.DELIVERY ? "Je veux manger" : (activeType === OrderType.PICKUP ? "A emporter" : "Menu")}
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
              selectedCategoryId={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </Animated.View>

          {selectedCategoryData && (
            <Animated.View 
              entering={FadeInUp.duration(600).springify()}
              layout={Layout.springify()}
            >
              <MenuCategory title={selectedCategoryData.name} />
            </Animated.View>
          )}

          {error ? (
            <View className="py-8">
              <Text className="text-center text-gray-500 font-urbanist-medium">
                {error}
              </Text>
            </View>
          ) : filteredMenuItems.length > 0 ? (
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
            <View className="py-8">
              <Text className="text-center text-gray-500 font-urbanist-medium">
                Aucun plat disponible dans cette catégorie
              </Text>
            </View>
          )}
        </Animated.View>
      </AnimatedScrollView>

      {/* Supprimer les boutons flottants qui apparaissent après avoir choisi le type de réservation */}
      {/* {isReservationActive && (
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
      )} */}
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
