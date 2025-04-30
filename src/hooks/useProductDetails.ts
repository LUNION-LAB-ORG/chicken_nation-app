import { useState, useEffect } from "react";
import { getMenuById } from "@/services/menuService";  
import { calculateDiscountPercentage } from "@/utils/priceHelpers";

/**
 * Hook personnalisé pour gérer les détails d'un produit
 * @param productId ID du produit à récupérer
 */
export const useProductDetails = (productId: string) => {
  const [menuItem, setMenuItem] = useState<any>(null);
  const [promoDetails, setPromoDetails] = useState<any>(null);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les données du menu
  useEffect(() => {
    const fetchMenuData = async () => {
      if (!productId) return;

      try {
        setIsLoadingMenu(true);
        setError(null);

        const menuData = await getMenuById(productId);

        if (menuData) {
          setMenuItem(menuData);

          // Si le menu est en promotion, définir les détails de promotion
          if (menuData.is_promotion && menuData.promotion_price) {
            setPromoDetails({
              discountedPrice: menuData.promotion_price,
              discountPercentage: calculateDiscountPercentage(parseFloat(menuData.price), parseFloat(menuData.promotion_price)),
            });
          }
        } else {
          setError("Ce produit n'est pas disponible.");
        }
      } catch (err) {
        console.error("Error fetching menu item:", err);
        setError("Erreur lors du chargement du produit");
      } finally {
        setIsLoadingMenu(false);
      }
    };

    fetchMenuData();
  }, [productId]);

  return {
    menuItem,
    promoDetails,
    isLoadingMenu,
    error,
  };
};

export default useProductDetails;
