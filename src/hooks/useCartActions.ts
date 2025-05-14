import { useState, useMemo } from "react";
import useCartStore from "@/store/cartStore";
import { router } from "expo-router";
import { extractPriceNumber, formatPrice } from "@/utils/priceHelpers";

/**
 * Hook personnalisé pour gérer les actions liées au panier
 * @param productId ID du produit
 * @param menuItem Données du produit
 * @param promoDetails Détails de la promotion si applicable
 */
export const useCartActions = (productId: string, menuItem: any, promoDetails: any) => {
  const { addToCart, removeFromCart, items } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedSupplements, setSelectedSupplements] = useState<{
    [key: string]: {
      name: string;
      price: string;
      isIncluded: boolean;
    }[];
  }>({});
  const [showCustomizations, setShowCustomizations] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Vérifier si le produit est déjà dans le panier
  const cartItem = useMemo(() => {
    return items.find(item => item.id === productId);
  }, [items, productId]);

  // Initialiser les données du produit à partir du panier si disponible
  useMemo(() => {
    if (cartItem && menuItem) {
      console.log("[ProductId] Initialisation depuis le panier:", cartItem);
      
      // Définir la quantité à partir du panier
      setQuantity(cartItem.quantity);
      
      // Récupérer les suppléments du panier
      if (cartItem.options || cartItem.extras) {
        const supplementsFromCart: {
          [key: string]: {
            name: string;
            price: string;
            isIncluded: boolean;
          }[];
        } = {};
        
        // Parcourir les catégories de suppléments du menu
        if (menuItem.supplements) {
          Object.entries(menuItem.supplements).forEach(([category, details]: [string, any]) => {
            // Vérifier si cette catégorie existe dans les options du panier
            const cartSupplements = cartItem.options && cartItem.options[category] ? 
              cartItem.options[category] : [];
            
            // Vérifier aussi dans le tableau extras pour compatibilité
            const extrasFromCart = cartItem.extras || [];
            
            // Trouver les suppléments correspondants dans le menu
            const selectedSupps = details.items
              .filter((item: any) => {
                // Vérifier si le supplément est dans les options de catégorie ou dans le tableau extras
                return cartSupplements.includes(item.name) || 
                      extrasFromCart.includes(item.name);
              })
              .map((item: any) => ({
                name: item.name,
                price: item.price,
                isIncluded: details.isIncluded || false
              }));
            
            if (selectedSupps.length > 0) {
              supplementsFromCart[category] = selectedSupps;
            }
          });
        }
        
        if (Object.keys(supplementsFromCart).length > 0) {
          console.log("[ProductId] Suppléments chargés:", supplementsFromCart);
          setSelectedSupplements(supplementsFromCart);
          setShowCustomizations(true);
        }
      }
    }
  }, [cartItem, menuItem]);

  // Gérer l'augmentation de la quantité
  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  // Gérer la diminution de la quantité
  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Gérer la sélection d'un supplément
  const handleSupplementSelect = (category: string, supplement: any) => {
    setSelectedSupplements((prev) => {
      const categoryItems = prev[category] || [];
      const existingIndex = categoryItems.findIndex(
        (item) => item.name === supplement.name
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
              isIncluded: supplement.isIncluded || false,
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
  const calculateTotalPrice = (): {
    formattedTotal: string;
    basePrice: number;
    supplementsPrice: number;
    total: number;
  } => {
    if (!menuItem) return {
      formattedTotal: "0 FCFA",
      basePrice: 0,
      supplementsPrice: 0,
      total: 0
    };

    let basePrice = promoDetails
      ? extractPriceNumber(promoDetails.discountedPrice)
      : extractPriceNumber(menuItem.price);

    if (isNaN(basePrice)) basePrice = 0;

    // Ajouter le prix des suppléments non inclus
    let supplementsPrice = 0;
    Object.values(selectedSupplements).forEach((items) => {
      items.forEach((item) => {
        if (!item.isIncluded) {
          // Correction du prix des suppléments
          // Extraire le prix en tant que nombre et s'assurer qu'il n'est pas multiplié incorrectement
          let itemPrice = 0;
          
          // Vérifier si le prix est déjà un nombre
          if (typeof item.price === 'number') {
            itemPrice = item.price;
          } else {
            // Extraire uniquement les chiffres du prix
            const priceMatch = item.price.match(/\d+/);
            if (priceMatch) {
              itemPrice = parseInt(priceMatch[0], 10);
            }
          }
          
          if (!isNaN(itemPrice)) {
            console.log(`Supplément: ${item.name}, Prix: ${itemPrice} FCFA`);
            supplementsPrice += itemPrice;
          }
        }
      });
    });

    // MODIFICATION: Ne pas multiplier le prix des suppléments par la quantité
    // Multiplier seulement le prix de base par la quantité, puis ajouter le prix des suppléments
    const total = (basePrice * quantity) + supplementsPrice;
    
    console.log(`Prix de base: ${basePrice} FCFA, Quantité: ${quantity}, Prix des suppléments: ${supplementsPrice} FCFA, Total: ${total} FCFA`);
    
    return {
      formattedTotal: formatPrice(total),
      basePrice,
      supplementsPrice,
      total: Math.round(total)
    };
  };

  // Gérer l'ajout au panier
  const handleAddToCart = async () => {
    if (!menuItem) return;
    
    // S'assurer qu'il y a au moins un produit dans le panier
    const finalQuantity = quantity > 0 ? quantity : 1;
    setQuantity(finalQuantity);

    // Préparer les suppléments sélectionnés
    const supplements = {};
    Object.keys(selectedSupplements).forEach((key) => {
      supplements[key] = selectedSupplements[key].map((item) => item.name);
    });

    // Calculer le prix total
    const { basePrice, supplementsPrice, total } = calculateTotalPrice();

    // Ajouter l'article au panier
    const item = {
      id: menuItem.id,
      name: menuItem.name,
      price: basePrice, // Prix unitaire de base
      quantity: finalQuantity,
      image: menuItem.image,
      description: menuItem.description,
      options: supplements,
      extras: Object.values(selectedSupplements).flat().map((s) => s.name),
      category: menuItem.category || "",
      isPromo: promoDetails ? true : false,
      originalPrice: promoDetails ? parseFloat(menuItem.price) : null,
      supplementsPrice: supplementsPrice // Prix des suppléments par unité
    };

    // Désactiver le bouton et montrer l'état de chargement
    setIsLoading(true);
    
    try {
      // Si on est en train de modifier un article existant, utiliser updateQuantity au lieu d'addToCart
      if (cartItem) {
        console.log("[ProductId] Mise à jour d'un article existant dans le panier");
        // Utiliser removeFromCart puis addToCart pour garantir que les suppléments sont mis à jour
        await removeFromCart(menuItem.id);
        await addToCart(item);
        
        // Afficher un message de succès
        setSuccessMessage("Menu mis à jour dans le panier");
      } else {
        // Ajouter un nouvel article
        console.log("[ProductId] Ajout d'un nouvel article au panier");
        await addToCart(item);
        
        // Afficher un message de succès
        setSuccessMessage("Menu ajouté au panier");
      }
      
      // Afficher le modal de succès
      setShowSuccessModal(true);
      
      // Réinitialiser la quantité et les suppléments après un court délai
      setTimeout(() => {
        setQuantity(0);
        setSelectedSupplements({});
        setShowCustomizations(false);
        setIsLoading(false);
        
        // Rediriger vers le panier après un court délai
        setTimeout(() => {
          router.push("/cart");
        }, 500);
      }, 1000);
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error);
      setIsLoading(false);
    }
  };

  return {
    quantity,
    selectedSupplements,
    showCustomizations,
    isLoading,
    cartItem,
    successMessage,
    showSuccessModal,
    handleIncrement,
    handleDecrement,
    handleSupplementSelect,
    isSupplementSelected,
    calculateTotalPrice,
    handleAddToCart,
    setShowCustomizations,
    setShowSuccessModal
  };
};

export default useCartActions;
