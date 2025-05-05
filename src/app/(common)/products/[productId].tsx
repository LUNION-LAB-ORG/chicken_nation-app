import React from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Share,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, router } from "expo-router";
import CustomStatusBar from "@/components/ui/CustomStatusBar";
import DynamicHeader from "@/components/home/DynamicHeader";
import SuccessModal from "@/components/ui/SuccessModal";
import ConfirmRemoveFavoriteModal from "@/components/ui/ConfirmRemoveFavoriteModal";
import { useAuth } from "@/app/context/AuthContext";
import { StyleSheet } from "react-native";
import GradientButton from "@/components/ui/GradientButton";

// Hooks personnalisés
import useProductDetails from "@/hooks/useProductDetails";
import useFavorites from "@/hooks/useFavorites";
import useCartActions from "@/hooks/useCartActions";

// Composants produit
import ProductHeader from "@/components/product/ProductHeader";
import ProductInfo from "@/components/product/ProductInfo";
import ProductSupplements from "@/components/product/ProductSupplements";
import AddToCartButton from "@/components/product/AddToCartButton";

 
const ProductId = () => {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { isAuthenticated, accessToken } = useAuth();
  
  // Récupération des détails du produit
  const { menuItem, promoDetails, isLoadingMenu, error } = useProductDetails(productId as string);
  
  // Gestion des favoris
  const { 
    isLiked, 
    isFavoriteLoading, 
    showConfirmModal, 
    showSuccessModal: favoriteSuccessModal, 
    successMessage: favoriteSuccessMessage, 
    handleFavoriteToggle, 
    handleConfirmRemoveFavorite, 
    handleCancelRemoveFavorite, 
    setShowSuccessModal: setFavoriteSuccessModal 
  } = useFavorites(productId as string, isAuthenticated, menuItem?.name || "", accessToken);
  
  // Gestion du panier
  const { 
    quantity, 
    selectedSupplements, 
    showCustomizations, 
    isLoading, 
    successMessage: cartSuccessMessage,
    showSuccessModal: cartSuccessModal,
    handleIncrement, 
    handleDecrement, 
    handleSupplementSelect, 
    isSupplementSelected, 
    calculateTotalPrice, 
    handleAddToCart, 
    setShowCustomizations,
    setShowSuccessModal: setCartSuccessModal
  } = useCartActions(productId as string, menuItem, promoDetails);

  // Préparation des suppléments pour l'affichage
  const { includedSupplements, paidSupplements } = React.useMemo(() => {
    if (!menuItem?.supplements) return { includedSupplements: [], paidSupplements: [] };

    const included = [];
    const paid = [];

    Object.entries(menuItem.supplements).forEach(([category, details]: [string, any]) => {
      if (details.isIncluded) {
        included.push({ ...details, category, type: category === "FOOD" ? "Accompagnements" : category === "DRINK" ? "Boissons" : category === "ACCESSORY" ? "Extras" : category });
      } else {
        paid.push({ ...details, category, type: category === "FOOD" ? "Accompagnements" : category === "DRINK" ? "Boissons" : category === "ACCESSORY" ? "Extras" : category });
      }
    });

    return { includedSupplements: included, paidSupplements: paid };
  }, [menuItem?.supplements]);

  // Gérer le partage du produit
  const handleShare = async () => {
    if (!menuItem) return;

    try {
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
    }
  };

  // Gérer la redirection vers les commentaires
  const handleViewComments = () => {
    router.push("/(authenticated-only)/comments");
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

  // Calculer le prix total
  const { formattedTotal } = calculateTotalPrice();

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="fixed z-50">
        <CustomStatusBar />
        <View className="px-6 -mt-6 mb-4">
          <DynamicHeader
            displayType="back-with-logo"
            showCart={true}
            showProgressBar={false}
            progressPercent={0}
          />
        </View>
      </View>

      {/* Modal de succès pour les favoris */}
      <SuccessModal
        visible={favoriteSuccessModal}
        message={favoriteSuccessMessage}
        onClose={() => setFavoriteSuccessModal(false)}
      />

      {/* Modal de succès pour le panier */}
      <SuccessModal
        visible={cartSuccessModal}
        message={cartSuccessMessage}
        onClose={() => setCartSuccessModal(false)}
      />

      {/* Modal de confirmation pour la suppression des favoris */}
      <ConfirmRemoveFavoriteModal
        visible={showConfirmModal}
        dishName={menuItem?.name || ""}
        onConfirm={handleConfirmRemoveFavorite}
        onCancel={handleCancelRemoveFavorite}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-6 mt-2">
          {/* Image et boutons d'action */}
          <ProductHeader
            image={menuItem.image}
            isLiked={isLiked}
            isPromo={!!promoDetails}
            discountPercentage={promoDetails?.discountPercentage}
            onFavoriteToggle={handleFavoriteToggle}
            isFavoriteLoading={isFavoriteLoading}
            onShare={handleShare}
          />

          {/* Informations du produit */}
          <ProductInfo
            name={menuItem.name}
            rating={menuItem.rating}
            price={promoDetails ? promoDetails.discountedPrice : menuItem.price}
            originalPrice={promoDetails ? menuItem.price : undefined}
            isPromo={!!promoDetails}
            isAuthenticated={isAuthenticated}
            onViewComments={handleViewComments}
            quantity={quantity}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            description={menuItem.description}
          />

          {/* Suppléments */}
          <ProductSupplements
            includedSupplements={includedSupplements}
            paidSupplements={paidSupplements}
            showCustomizations={showCustomizations}
            onToggleCustomizations={() => setShowCustomizations(!showCustomizations)}
            isSupplementSelected={isSupplementSelected}
            onSupplementSelect={handleSupplementSelect}
          />
        </View>
      </ScrollView>

      {/* Bouton "Ajouter au panier" */}
      {isAuthenticated ? (
        <View style={styles.bottomButtons}>
          <AddToCartButton
            isLoading={isLoading}
            totalPrice={formattedTotal}
            onPress={handleAddToCart}
          />
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
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  }
});

export default ProductId;
