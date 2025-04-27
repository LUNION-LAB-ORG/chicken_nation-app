import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
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
// Remplacer l'import des données mockées par le service de menu
import { getMenuById } from "@/services/menuService";
import { useAuth } from "@/app/context/AuthContext";
import * as Sharing from "expo-sharing";
import * as FileSystem from 'expo-file-system';
import { Share } from 'react-native';
import { addToFavorites, removeFromFavorites, checkIsFavorite } from "@/services/api/favorites";

const ProductId = () => {
  const { productId, offerId } = useLocalSearchParams<{
    productId: string;
    offerId?: string;
  }>();
  const router = useRouter();

  // État pour stocker les données du menu
  const [menuItem, setMenuItem] = useState<any>(null);
  const [promoDetails, setPromoDetails] = useState<any>(null);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Ajouter un état local pour le "like"
  const [isLiked, setIsLiked] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  // Récupération de l'état de réservation
  const { isActive } = useReservationStore();
  const { user } = useAuth(); // Ajout de l'authentification réelle
  const isAuthenticated = user; // Utilisation de l'état d'auth au lieu de isActive

  const addToCart = useCartStore((state) => state.addToCart);
  const decrementItem = useCartStore((state) => state.decrementItem);

  // Charger les données du menu depuis l'API
  useEffect(() => {
    const fetchMenuData = async () => {
      if (!productId) return;
      
      try {
        setIsLoadingMenu(true);
        setError(null);
        
        console.log(`🔍 Chargement des détails du menu ${productId}...`);
        const menuData = await getMenuById(productId);
        
        if (menuData) {
          console.log(`✅ Détails du menu chargés avec succès:`, JSON.stringify(menuData, null, 2));
          console.log(`🔎 Suppléments disponibles:`, menuData.supplements ? Object.keys(menuData.supplements) : 'aucun');
          if (menuData.supplements) {
            console.log(`📋 Structure des suppléments:`, JSON.stringify(menuData.supplements, null, 2));
          }
          setMenuItem(menuData);
          
          // Si le menu est en promotion, définir les détails de promotion
          if (menuData.is_promotion && menuData.promotion_price) {
            setPromoDetails({
              discount: calculateDiscountPercentage(menuData.price, menuData.promotion_price),
              originalPrice: menuData.price.toString(),
              discountedPrice: menuData.promotion_price.toString(),
            });
          }
        } else {
          console.warn(`⚠️ Aucun détail trouvé pour le menu ${productId}`);
          setError("Ce produit n'est pas disponible.");
        }
      } catch (err) {
        console.error(`❌ Erreur lors du chargement des détails du menu:`, err);
        setError("Impossible de charger les détails du produit.");
      } finally {
        setIsLoadingMenu(false);
      }
    };
    
    fetchMenuData();
  }, [productId]);

  // Vérifier si le menu est dans les favoris
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!productId || !isAuthenticated) return;
      
      try {
        const isFavorite = await checkIsFavorite(productId);
        setIsLiked(isFavorite);
      } catch (error) {
        // Ignorer les erreurs silencieusement
      }
    };

    checkFavoriteStatus();
  }, [productId, isAuthenticated]);

  // Calculer le pourcentage de réduction
  const calculateDiscountPercentage = (originalPrice: number, discountedPrice: number): number => {
    if (!originalPrice || !discountedPrice || originalPrice <= 0) return 0;
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  };

  // Calculer le prix avec réduction
  const calculateDiscountedPrice = (originalPrice: string, discountPercentage: number): string => {
    const price = parseFloat(originalPrice.replace(/[^\d.-]/g, ""));
    if (isNaN(price)) return originalPrice;
    const discountedPrice = price - (price * discountPercentage) / 100;
    return `${Math.round(discountedPrice)} FCFA`;
  };

  // Gérer l'augmentation de la quantité
  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  // Gérer la diminution de la quantité
  const handleDecrement = () => {
    if (quantity > 0) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Gérer l'ajout au panier
  const handleAddToCart = () => {
    if (!menuItem) return;
    
    if (quantity > 0) {
      // Préparer les suppléments sélectionnés
      const supplements = {};
      Object.keys(selectedSupplements).forEach((key) => {
        supplements[key] = selectedSupplements[key].map((item) => item.name);
      });

      // Ajouter au panier
      addToCart({
        id: menuItem.id,
        name: menuItem.name,
        price: promoDetails ? parseFloat(promoDetails.discountedPrice) : parseFloat(menuItem.price),
        quantity,
        image: menuItem.image,
        options: supplements,
      });

      // Réinitialiser la quantité et les suppléments
      setQuantity(0);
      setSelectedSupplements({});
      setShowCustomizations(false);

      // Afficher un message de confirmation
      console.log("Produit ajouté au panier !");
    }
  };

  // Gérer la sélection d'un supplément
  const handleSupplementSelect = (category: string, supplement: any) => {
    setSelectedSupplements((prev) => {
      const categoryItems = prev[category] || [];
      const existingIndex = categoryItems.findIndex(
        (item) => item.name === supplement.name,
      );

      if (existingIndex >= 0) {
        // Si l'élément existe déjà, le supprimer
        return {
          ...prev,
          [category]: categoryItems.filter((_, i) => i !== existingIndex),
        };
      } else {
        // Sinon, l'ajouter
        return {
          ...prev,
          [category]: [
            ...categoryItems,
            { 
              name: supplement.name, 
              price: supplement.price, 
              isIncluded: supplement.isIncluded || false 
            },
          ],
        };
      }
    });
  };

  // Vérifier si un supplément est sélectionné
  const isSupplementSelected = (category: string, name: string): boolean => {
    const categoryItems = selectedSupplements[category] || [];
    return categoryItems.some((item) => item.name === name);
  };

  // Calculer le prix total
  const totalPrice = useMemo(() => {
    if (!menuItem) return "0 FCFA";

    let basePrice = promoDetails
      ? parseFloat(promoDetails.discountedPrice.replace(/[^\d.-]/g, ""))
      : parseFloat(menuItem.price);

    if (isNaN(basePrice)) basePrice = 0;

    // Ajouter le prix des suppléments non inclus
    let supplementsPrice = 0;
    Object.values(selectedSupplements).forEach((items) => {
      items.forEach((item) => {
        if (!item.isIncluded) {
          const itemPrice = parseFloat(item.price.replace(/[^\d.-]/g, ""));
          if (!isNaN(itemPrice)) {
            supplementsPrice += itemPrice;
          }
        }
      });
    });

    const total = (basePrice + supplementsPrice) * quantity;
    return `${Math.round(total)} FCFA`;
  }, [menuItem, promoDetails, selectedSupplements, quantity]);

  // Gérer le partage du produit
  const handleShare = async () => {
    if (!menuItem) return;

    try {
      setIsLoading(true);
      const message = `Découvre ${menuItem.name} sur Chicken Nation ! ${
        promoDetails ? `En promotion à ${promoDetails.discountedPrice} !` : ""
      }`;

      // Partager via l'API Share native
      await Share.share({
        message,
        title: "Partager ce plat",
      });
    } catch (error) {
      console.error("Erreur lors du partage:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer l'ajout/suppression des favoris
  const handleFavoriteToggle = async () => {
    if (!menuItem || !isAuthenticated) {
      Alert.alert("Connexion requise", "Veuillez vous connecter pour ajouter ce plat à vos favoris.");
      return;
    }

    if (isFavoriteLoading) return;
    
    try {
      setIsFavoriteLoading(true);
      
      if (isLiked) {
        // Supprimer des favoris
        const success = await removeFromFavorites(productId);
        if (success) {
          setIsLiked(false);
          Alert.alert("Succès", "Ce plat a été retiré de vos favoris.");
        } else {
          Alert.alert("Erreur", "Impossible de retirer ce plat de vos favoris. Veuillez réessayer.");
        }
      } else {
        // Ajouter aux favoris
        const success = await addToFavorites(productId);
        if (success) {
          setIsLiked(true);
          Alert.alert("Succès", "Ce plat a été ajouté à vos favoris.");
        } else {
          Alert.alert("Erreur", "Impossible d'ajouter ce plat à vos favoris. Veuillez réessayer.");
        }
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setIsFavoriteLoading(false);
    }
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
          included.push({ ...details, category, type: category === "FOOD" 
            ? "Accompagnements" 
            : category === "DRINK" 
              ? "Boissons" 
              : category === "ACCESSORY" 
                ? "Extras" 
                : category });
        } else {
          paid.push({ ...details, category, type: category === "FOOD" 
            ? "Accompagnements" 
            : category === "DRINK" 
              ? "Boissons" 
              : category === "ACCESSORY" 
                ? "Extras" 
                : category });
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
            {supp.items && supp.items.map((item, idx) => (
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

          {details.items && details.items.map((item: any) => (
            <View
              key={item.id}
              className="flex-row items-center justify-between py-1 border-b border-gray-100"
            >
              <View className="flex-1">
                <Text className="font-urbanist-medium">
                  {item.name} {!details.isIncluded && (
                    <Text className="text-gray-700 font-urbanist-bold">- {item.price} FCFA</Text>
                  )}
                </Text>
              </View>
              <CustomCheckbox
                isChecked={isSupplementSelected(category, item.name)}
                onPress={() =>
                  handleSupplementSelect(category, {
                    ...item,
                    isIncluded: details.isIncluded || false,
                  })
                }
              />
            </View>
          ))}
        </View>
      ),
    );
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
        id: menuItem.id,
        name: menuItem.name,
        price: promoDetails ? parseFloat(promoDetails.discountedPrice) : parseFloat(menuItem.price),
        quantity: 1,
        image: menuItem.image,
        description: menuItem.description,
        extras: Object.values(selectedSupplements).flat().map(s => s.name),
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

  // Afficher un indicateur de chargement pendant le chargement des données
  if (isLoadingMenu) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <StatusBar style="dark" />
        <CustomStatusBar />
        <ActivityIndicator size="large" color="#F97316" />
        <Text className="mt-4 text-gray-600 font-urbanist-medium">Chargement du produit...</Text>
      </View>
    );
  }

  // Afficher un message d'erreur si le chargement a échoué
  if (error || !menuItem) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-4">
        <StatusBar style="dark" />
        <CustomStatusBar />
        <Text className="text-red-500 font-urbanist-bold text-lg mb-2">Erreur</Text>
        <Text className="text-gray-600 font-urbanist-medium text-center">{error || "Produit non trouvé"}</Text>
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
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="fixed   z-50">
        <CustomStatusBar />
        <View className="px-6 -mt-6 mb-4">
            <DynamicHeader
              displayType="back-with-logo"
              showCart={true} 
              showProgressBar={isActive}
              progressPercent={70}
              reservationContext={true}
            />
          </View>

      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: isActive ? 100 : 20 }}
      >
        <View className="px-6 mt-2">
          {/* Header standard avec logo et panier */}
        
          {/* Contenu du produit */}
          <View  >
            {/* Image et boutons d'action */}
            <View 
              className="relative rounded-3xl overflow-hidden"
              style={{ 
                borderWidth: 1,
                borderColor: '#FDE9DA', 
                borderStyle: 'solid',
                marginBottom: 10
              }}
            >
              <Image
                source={{ uri: menuItem.image }}
                className="w-full h-[300px] "
                style={{ resizeMode: "contain" }}
              />
              <View className="absolute bg-white border-[1px] border-gray-400 px-3 py-1.5 rounded-2xl top-4 right-4 flex-row  ">
                <TouchableOpacity 
                  className="p-2"
                  onPress={handleFavoriteToggle}
                  disabled={isFavoriteLoading}
                >
                  {isFavoriteLoading ? (
                    <ActivityIndicator size="small" color="#F97316" />
                  ) : (
                    <FontAwesome name={isLiked ? "heart" : "heart-o"} size={20} color="#F97316" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity className="p-2 ml-1" onPress={handleShare}>
                  <Image
                    source={require("../../../assets/icons/share.png")}
                    style={{ width: 20, height: 20, resizeMode: "contain" }}
                  />
                </TouchableOpacity>
              </View>
              
              {/* Badge de promotion */}
              {promoDetails && (
                <View className="absolute top-4 left-4 bg-red-500 px-2 py-1 rounded-lg">
                  <Text className="text-white font-urbanist-bold text-xs">
                    -{promoDetails.discount}%
                  </Text>
                </View>
              )}
            </View>

            {/* Titre et évaluations */}
            <View className="flex-row justify-center items-center mt-8 mb-4">
              <Text className="text-3xl text-center font-urbanist-bold uppercase text-black">
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
                  <FontAwesome name="minus" size={18}  className="text-sm" color="#f97316" />
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
