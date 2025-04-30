import { useState, useEffect } from "react";
import { getUserFavorites, addToFavorites, removeFromFavorites } from "@/services/api/favorites";
import { Alert } from "react-native";
import { router } from "expo-router";
import { setAuthToken } from "@/services/api/api";

/**
 * Hook personnalisé pour gérer les favoris
 * @param productId ID du produit
 * @param isAuthenticated Statut d'authentification de l'utilisateur
 * @param productName Nom du produit pour les messages
 * @param accessToken Token d'authentification de l'utilisateur
 */
export const useFavorites = (
  productId: string, 
  isAuthenticated: boolean, 
  productName: string,
  accessToken: string | null
) => {
  const [isLiked, setIsLiked] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Configurer le token d'authentification quand il change
  useEffect(() => {
    if (accessToken) {
      setAuthToken(accessToken);
    }
  }, [accessToken]);

  // Vérifier si le plat est dans les favoris
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!productId || !isAuthenticated || !accessToken) {
        setIsLiked(false);
        return;
      }

      try {
        // S'assurer que le token est configuré avant l'appel API
        setAuthToken(accessToken);
        
        const favorites = await getUserFavorites();

        // Trouver le favori correspondant au plat actuel
        const favorite = favorites.find((fav) => fav.id === productId);

        if (favorite) {
          setIsLiked(true);

          // Stocker l'ID du favori dans une variable d'état dédiée
          if (favorite.favorite_id) {
            setFavoriteId(favorite.favorite_id);
          }
        } else {
          console.log(`[Favoris] Plat non trouvé dans les favoris`);
          setIsLiked(false);
          setFavoriteId(null);
        }
      } catch (error) {
        console.log(`[Favoris] Erreur lors de la vérification: ${error}`);
      }
    };

    checkFavoriteStatus();
  }, [productId, isAuthenticated, accessToken]);

  // Gérer l'ajout/suppression des favoris
  const handleFavoriteToggle = async () => {
    // Vérifier si l'utilisateur est connecté
    if (!isAuthenticated) {
      Alert.alert(
        "Connexion requise",
        "Veuillez vous connecter pour ajouter ce plat à vos favoris.",
        [
          { text: "Annuler", style: "cancel" },
          { text: "Se connecter", onPress: () => router.push("/(tabs-guest)/login") },
        ]
      );
      return;
    }

    if (!productId || isFavoriteLoading || !accessToken) return;

    // S'assurer que le token est configuré avant l'appel API
    setAuthToken(accessToken);

    // Si c'est déjà dans les favoris, on affiche le modal de confirmation
    if (isLiked) {
      setShowConfirmModal(true);
      return;
    }

    // Sinon on ajoute aux favoris directement
    try {
      setIsFavoriteLoading(true);

      const success = await addToFavorites(productId);
      if (success) {
        // Mettre à jour l'état local
        setIsLiked(true);

        // Récupérer l'ID du favori pour la suppression future
        const favorites = await getUserFavorites();
        const favorite = favorites.find((fav) => fav.id === productId);
        if (favorite && favorite.favorite_id) {
          setFavoriteId(favorite.favorite_id);
        }

        setSuccessMessage(`${productName} a été ajouté à vos favoris`);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout aux favoris:", error);
      Alert.alert("Erreur", "Impossible d'ajouter ce plat à vos favoris");
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  // Confirmer la suppression du favori
  const handleConfirmRemoveFavorite = async () => {
    if (!favoriteId || !accessToken) {
      console.log(`[Favoris] Impossible de supprimer - Pas d'ID de favori disponible ou pas de token`);
      setShowConfirmModal(false);
      return;
    }

    try {
      setIsFavoriteLoading(true);
      
      // S'assurer que le token est configuré avant l'appel API
      setAuthToken(accessToken);
      
      const success = await removeFromFavorites(favoriteId);
      if (success) {
        setIsLiked(false);
        setFavoriteId(null);
        setSuccessMessage(`${productName} a été retiré de vos favoris`);
        setShowSuccessModal(true);
      } else {
        console.log(`[Favoris] Échec de la suppression`);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du favori:", error);
      Alert.alert("Erreur", "Impossible de retirer ce plat de vos favoris");
    } finally {
      setIsFavoriteLoading(false);
      setShowConfirmModal(false);
    }
  };

  // Annuler la suppression
  const handleCancelRemoveFavorite = () => {
    setShowConfirmModal(false);
  };

  return {
    isLiked,
    isFavoriteLoading,
    showConfirmModal,
    showSuccessModal,
    successMessage,
    handleFavoriteToggle,
    handleConfirmRemoveFavorite,
    handleCancelRemoveFavorite,
    setShowSuccessModal,
  };
};

export default useFavorites;
