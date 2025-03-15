import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import { FontAwesome } from "@expo/vector-icons";
import DynamicHeader from "@/components/home/DynamicHeader";
import GradientButton from "@/components/ui/GradientButton";
import useCartStore from "@/store/cartStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import useReservationStore from "@/store/reservationStore";
import CustomCheckbox from "@/components/ui/CustomCheckbox";
import { menuItems, promoBanners } from "@/data/MockedData";
import { useAuth } from "@/app/context/AuthContext";

const ProductId = () => {
  const { productId, offerId } = useLocalSearchParams<{
    productId: string;
    offerId?: string;
  }>();
  const router = useRouter();

  // État pour stocker les données du menu
  const [menuItem, setMenuItem] = useState<any>(null);
  const [promoDetails, setPromoDetails] = useState<any>(null);

  const [quantity, setQuantity] = useState(0);
  const [showCustomizations, setShowCustomizations] = useState(false);
  const [selectedAccompaniments, setSelectedAccompaniments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Ajouter un état pour les suppléments sélectionnés avec leurs prix
  const [selectedSupplements, setSelectedSupplements] = useState<{
    [key: string]: {
      name: string;
      price: string;
      isIncluded: boolean;
    }[];
  }>({});

  // Récupération de l'état de réservation
  const { isActive } = useReservationStore();
  const { user } = useAuth(); // Ajout de l'authentification réelle
  const isAuthenticated = user; // Utilisation de l'état d'auth au lieu de isActive

  const addToCart = useCartStore((state) => state.addToCart);
  const decrementItem = useCartStore((state) => state.decrementItem);

  // Charger les données du menu et les détails de promotion
  useEffect(() => {
    if (productId) {
      // Trouver le menu
      const item = menuItems.find((m) => m.id === productId);

      if (offerId) {
        // Trouver la bannière promo correspondante
        const banner = promoBanners.find((b) => b.offerId === offerId);
        if (banner && banner.menuIds.includes(productId)) {
          setPromoDetails({
            discount: banner.promoDetails.discount,
            originalPrice: banner.promoDetails.originalPrices[productId],
            discountedPrice: calculateDiscountedPrice(
              banner.promoDetails.originalPrices[productId],
              banner.promoDetails.discount,
            ),
          });
        }
      }

      setMenuItem(item);
    }
  }, [productId, offerId]);

  const calculateDiscountedPrice = (
    price: string,
    discount: number,
  ): string => {
    const originalPrice = parseInt(price);
    const discounted = originalPrice - (originalPrice * discount) / 100;
    return discounted.toString();
  };

  // Calculer le prix total en tenant compte des suppléments
  const calculateTotalPrice = () => {
    if (!menuItem) return 0;

    let total = parseInt(
      promoDetails ? promoDetails.discountedPrice : menuItem.price,
    );

    // Ajouter le prix des suppléments non inclus sélectionnés
    Object.values(selectedSupplements).forEach((supplements) => {
      supplements.forEach((supp) => {
        if (!supp.isIncluded) {
          total += parseInt(supp.price);
        }
      });
    });

    return total;
  };

  // Gérer la sélection d'un supplément
  const handleSupplementSelect = (category: string, supplement: any) => {
    setSelectedSupplements((prev) => ({
      ...prev,
      [category]: [
        ...(prev[category] || []),
        {
          name: supplement.name,
          price: supplement.price,
          isIncluded: supplement.isIncluded || false,
        },
      ],
    }));
  };

  // Filtrer les suppléments inclus et payants
  const { includedSupplements, paidSupplements } = useMemo(() => {
    if (!menuItem?.supplements) {
      return { includedSupplements: [], paidSupplements: [] };
    }

    const included = [];
    const paid = [];

    Object.entries(menuItem.supplements).forEach(
      ([category, details]: [string, any]) => {
        if (details.isIncluded) {
          included.push({ ...details, category });
        } else {
          paid.push({ ...details, category });
        }
      },
    );

    return { includedSupplements: included, paidSupplements: paid };
  }, [menuItem?.supplements]);

  // Affichage des suppléments inclus
  const renderIncludedSupplements = () => {
    if (includedSupplements.length === 0) return null;

    return (
      <View className="mt-4 bg-gray-100 p-4 rounded-3xl">
        <Text className="text-lg font-sofia-light text-black/50">
          Ce qui est inclus
        </Text>
        {includedSupplements.map((supp, index) => (
          <View key={index} className="mt-2">
            <Text className="text-lg font-sofia-light text-black/70">
              {supp.required ? "1 x " : ""}
              {supp.type}
            </Text>
            {supp.items.map((item, idx) => (
              <Text
                key={idx}
                className="ml-4 text-sm font-sofia-light text-black/50"
              >
                • {item.name}
              </Text>
            ))}
          </View>
        ))}
      </View>
    );
  };

  // Section de personnalisation
  const renderCustomizationSection = () => {
    if (paidSupplements.length === 0) return null;

    return (
      <View className="mt-4 bg-gray-100 p-4 mb-44 rounded-3xl">
        <TouchableOpacity
          className="flex-row justify-between items-center"
          onPress={() => setShowCustomizations(!showCustomizations)}
        >
          <Text className="text-lg font-sofia-light text-black/70">
            Personnaliser
          </Text>
          <Image
            source={
              showCustomizations
                ? require("../../../assets/icons/close.png")
                : require("../../../assets/icons/arrow-right-2.png")
            }
            style={{ width: 24, height: 24, resizeMode: "contain" }}
          />
        </TouchableOpacity>

        {showCustomizations && (
          <View className="mt-4">{renderSupplements()}</View>
        )}
      </View>
    );
  };

  // Affichage des suppléments disponibles
  const renderSupplements = () => {
    if (!menuItem?.supplements) return null;

    return Object.entries(menuItem.supplements).map(
      ([category, details]: [string, any]) => (
        <View key={category} className="mt-4 bg-gray-100 p-4 rounded-3xl">
          <Text className="text-lg font-sofia-medium text-black/70">
            {details.type}
            {details.isIncluded && (
              <Text className="text-sm font-sofia-light text-green-600">
                {" "}
                (Inclus)
              </Text>
            )}
          </Text>

          {details.items.map((item: any) => (
            <CustomCheckbox
              key={item.id}
              label={`${item.name} ${!details.isIncluded ? `(${item.price} FCFA)` : ""}`}
              value={
                selectedSupplements[category]?.some(
                  (s) => s.name === item.name,
                ) || false
              }
              onValueChange={() =>
                handleSupplementSelect(category, {
                  ...item,
                  isIncluded: details.isIncluded,
                })
              }
            />
          ))}
        </View>
      ),
    );
  };

  /**
   * Ajoute un produit au panier
   */
  const handleIncrement = () => {
    setQuantity(quantity + 1);
    const item = {
      id: String(productId),
      name: menuItem.name,
      price: promoDetails ? promoDetails.discountedPrice : menuItem.price,
      quantity: 1,
      image: menuItem.image,
      description: menuItem.description, // Ajout de la description
      extras: selectedAccompaniments,
    };
    addToCart(item);
  };

  /**
   * Diminue la quantité d'un produit dans le panier
   */
  const handleDecrement = () => {
    if (quantity > 0) {
      setQuantity(quantity - 1);
      decrementItem(String(productId));
    }
  };

  /**
   * Gère la sélection/désélection d'un accompagnement
   */
  const handleToggleAccompaniment = (accompaniment) => {
    setSelectedAccompaniments((prevSelected) => {
      if (prevSelected.includes(accompaniment)) {
        return prevSelected.filter((item) => item !== accompaniment);
      } else {
        return [...prevSelected, accompaniment];
      }
    });
  };

  /**
   * Gère l'annulation et le retour à l'écran précédent
   */
  const handleCancel = () => {
    router.back();
  };

  /**
   * Redirige vers la page des commentaires
   */
  const handleViewComments = () => {
    router.push("/(authenticated-only)/comments");
  };

  /**
   * Gère le clic sur "Préparer" - ajoute au panier puis redirige après un délai
   */
  const handlePrepare = async () => {
    // S'assurer qu'il y a au moins un produit dans le panier
    if (quantity === 0) {
      setQuantity(1);

      // Ajouter l'article au panier
      const item = {
        id: String(productId),
        name: menuItem.name,
        price: promoDetails ? promoDetails.discountedPrice : menuItem.price,
        quantity: 1,
        image: menuItem.image,
        description: menuItem.description, // Ajout de la description
        extras: selectedAccompaniments,
      };
      addToCart(item);
    }

    // Désactiver le bouton et montrer l'état de chargement
    setIsLoading(true);

    // Attendre 5 secondes
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Rediriger vers l'écran de finalisation de réservation
    router.push("/(authenticated-only)/reservation/finreservation");
  };

  /**
   * Gère le clic sur le bouton "Suivant" en mode réservation
   */
  const handleNext = () => {
    // Si l'utilisateur n'a rien ajouté au panier, ajouter au moins 1 produit
    if (quantity === 0) {
      handleIncrement();
    }

    // Rediriger vers la finalisation
    router.push("/(authenticated-only)/reservation/finreservation");
  };

  // Mise à jour de l'ajout au panier pour inclure les suppléments et la description
  const handleAddToCart = () => {
    if (!menuItem) return;

    const cartItem = {
      id: String(productId),
      name: menuItem.name,
      price: calculateTotalPrice(),
      quantity: 1,
      image: menuItem.image,
      description: menuItem.description, 
      extras: Object.values(selectedSupplements)
        .flat()
        .map((s) => s.name),
      originalPrice: promoDetails?.originalPrice,
      discount: promoDetails?.discount,
    };

    addToCart(cartItem);
    setQuantity((prev) => prev + 1);
  };

  if (!menuItem) return null;

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="absolute top-0 left-0 right-0 z-50">
        <CustomStatusBar />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: isActive ? 100 : 20 }}
      >
        <View className="px-6 pt-14">
          {/* Header standard avec logo et panier */}
          <View className="">
            <DynamicHeader
              displayType="back-with-logo"
              showCart={true} 
              showProgressBar={isActive}
              progressPercent={70}
              reservationContext={true}
            />
          </View>

          {/* Contenu du produit */}
          <View className="mt-6">
            {/* Image et boutons d'action */}
            <View className="relative">
              <Image
                source={menuItem.image}
                className="w-full border-[1px] border-orange-100 h-[300px] rounded-3xl"
                style={{ resizeMode: "cover" }}
              />
              <View className="absolute border-[1px] border-gray-100 px-2 rounded-3xl top-4 right-2 flex-row space-x-2">
                <TouchableOpacity className="p-2">
                  <FontAwesome name="heart-o" size={20} color="gray" />
                </TouchableOpacity>
                <TouchableOpacity className="p-2">
                  <Image
                    source={require("../../../assets/icons/share.png")}
                    style={{ width: 20, height: 20, resizeMode: "contain" }}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Titre et évaluations */}
            <View className="flex-row justify-center items-center mt-8 mb-4">
              <Text className="text-3xl text-center font-urbanist-bold text-black">
                {menuItem.name}
              </Text>
            </View>
            <View className="flex-row items-center mt-2">
              <FontAwesome name="star" size={16} color="#FFD700" />
              <Text className="ml-1 text-[13px] font-sofia-regular text-slate-500">
                {menuItem.rating}
              </Text>
              <TouchableOpacity 
                className="ml-4" 
                onPress={isAuthenticated ? handleViewComments : undefined}
              >
                <Text className="text-[13px] font-sofia-regular underline text-slate-500">
                  Voir les commentaires
                </Text>
              </TouchableOpacity>
              {!isAuthenticated && (
                <TouchableOpacity onPress={() => router.push("/(tabs-guest)/login")} className="ml-4">
                  <Text className="text-[11px] font-sofia-semibold uppercase bg-yellow p-2 rounded-lg text-slate-800">
                    Connecte-toi pour voir
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Prix et quantité */}
            <View className="flex-row justify-between items-center mt-6">
              <View>
                {promoDetails ? (
                  <>
                    <Text className="text-sm font-urbanist-regular text-gray-400 line-through">
                      {promoDetails.originalPrice} FCFA
                    </Text>
                    <Text className="text-2xl font-urbanist-regular text-orange-500">
                      {promoDetails.discountedPrice} FCFA
                    </Text>
                    <Text className="text-sm font-urbanist-regular text-green-500">
                      -{promoDetails.discount}%
                    </Text>
                  </>
                ) : (
                  <Text className="text-2xl font-urbanist-regular text-orange-500">
                    {menuItem.price} FCFA
                  </Text>
                )}
              </View>
              <View className="flex-row items-center ml-4">
                <TouchableOpacity
                  className="border-orange-500 border-2 rounded-full p-[9px] py-[7px]"
                  onPress={handleDecrement}
                >
                  <FontAwesome name="minus" size={18} color="#f97316" />
                </TouchableOpacity>
                <Text className="mx-4 text-lg font-sofia-light text-black/70">
                  {quantity.toString().padStart(2, "0")}
                </Text>
                <TouchableOpacity onPress={handleIncrement}>
                  <Image
                    source={require("../../../assets/icons/plus-rounded.png")}
                    style={{ width: 38, height: 38, resizeMode: "contain" }}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Description */}
            <Text className="mt-6 text-[16px] font-sofia-light text-[#595959]">
              {menuItem.description}
            </Text>

            {/* Suppléments inclus */}
            {renderIncludedSupplements()}

            {/* Personnalisations */}
            {renderCustomizationSection()}
          </View>
        </View>
      </ScrollView>

      {/* Boutons de navigation en bas - adaptatifs selon le contexte */}
      {isAuthenticated ? (
        <View style={styles.bottomButtons}>
          <GradientButton
            onPress={handlePrepare}
            disabled={isLoading}
            className="flex-1"
          >
            <View className="flex-row items-center justify-center">
              {isLoading ? (
                <ActivityIndicator
                  color="white"
                  size="small"
                  style={{ marginRight: 8 }}
                />
              ) : (
                <Image
                  source={require("../../../assets/icons/cook.png")}
                  style={{
                    width: 24,
                    height: 24,
                    resizeMode: "contain",
                    marginRight: 8,
                  }}
                />
              )}
              <Text className="text-white text-lg font-urbanist-medium">
                {isLoading ? "Préparation..." : "Préparer"}
              </Text>
            </View>
          </GradientButton>
        </View>
      ) : (
        // Bouton standard pour visiteurs non authentifiés
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            onPress={() => router.push("/(tabs-guest)/login")}
            className="flex-1"
          >
            <GradientButton className="w-full">
              Connexion requise
            </GradientButton>
          </TouchableOpacity>
        </View>
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

export default ProductId;
