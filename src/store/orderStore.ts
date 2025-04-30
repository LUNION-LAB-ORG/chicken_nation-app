import { create } from "zustand";
import { createOrder, getCustomerOrders, OrderResponse, OrderType } from "@/services/api/orders";
import { getCustomerDetails } from "@/services/api/customer";
import useCartStore from "./cartStore";
import useTakeawayStore from "./takeawayStore";
import useDeliveryStore, { DeliveryStep } from "./deliveryStore";
import { AuthStorage } from "@/services/storage/auth-storage";

interface OrderItem {
  dish_id: string;
  quantity: number;
  supplements_ids?: string[];
}

interface OrderState {
  orders: OrderResponse[];
  isLoading: boolean;
  currentOrderId: string | null;
  error: string | null;
  
  // Actions
  fetchOrders: () => Promise<void>;
  createDeliveryOrder: (
    addressId: string, 
    fullname: string, 
    phone: string, 
    email: string, 
    note?: string,
    promoCode?: string
  ) => Promise<string | null>;
  createTakeawayOrder: (
    fullname: string, 
    phone: string, 
    email: string, 
    note?: string,
    promoCode?: string
  ) => Promise<string | null>;
  resetOrderState: () => void;
}

/**
 * Formate un numéro de téléphone au format +225XXXXXXXX
 * @param phoneNumber Numéro de téléphone à formater
 * @returns Numéro de téléphone formaté
 */
const formatPhoneNumber = (phoneNumber: string) => {
  // Nettoyer le numéro (garder uniquement les chiffres)
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Si le numéro commence par 225, le supprimer pour éviter le doublement
  const cleanPhone = digits.startsWith('225') ? digits.substring(3) : digits;
  
  // Ajouter le préfixe +225
  return `+225${cleanPhone}`;
};

const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  isLoading: false,
  currentOrderId: null,
  error: null,

  /**
   * Récupère toutes les commandes de l'utilisateur
   */
  fetchOrders: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Récupérer l'ID de l'utilisateur connecté
      const userData = await AuthStorage.getUserData();
      if (!userData?.id) {
        throw new Error('Utilisateur non connecté');
      }
      
      // Récupérer les commandes
      const orders = await getCustomerOrders(userData.id);
      set({ orders, isLoading: false });
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Erreur lors de la récupération des commandes' 
      });
    }
  },

  /**
   * Crée une commande de type DELIVERY
   */
  createDeliveryOrder: async (
    addressId: string, 
    fullname: string, 
    phone: string, 
    email: string, 
    note?: string,
    promoCode?: string
  ) => {
    try {
      set({ isLoading: true, error: null });
      
      // Récupérer l'état du panier
      const cartStore = useCartStore.getState();
      const deliveryStore = useDeliveryStore.getState();
      
      // Vérifier si le panier est vide
      if (cartStore.items.length === 0) {
        throw new Error('Le panier est vide');
      }
      
      // Récupérer les données utilisateur directement depuis l'API pour avoir les informations les plus récentes
      const userData = await getCustomerDetails();
      if (!userData?.id) {
        throw new Error('Utilisateur non connecté ou introuvable');
      }
      
      // Vérifier que le numéro de téléphone est disponible
      if (!userData.phone) {
        throw new Error('Numéro de téléphone non disponible. Veuillez mettre à jour votre profil.');
      }
      
      // Convertir les éléments du panier au format attendu par l'API
      const orderItems: OrderItem[] = cartStore.items.map(item => {
        // Récupérer les suppléments avec leurs IDs réels
        const supplementsIds = item.extras?.filter(extra => {
          // Vérifier si l'extra est un UUID valide (format attendu par l'API)
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          return uuidRegex.test(extra);
        });

        return {
          dish_id: item.id,
          quantity: item.quantity,
          // N'inclure supplements_ids que s'il y a des suppléments valides
          ...(supplementsIds && supplementsIds.length > 0 ? { supplements_ids: supplementsIds } : {})
        };
      });
      
      // Préparer les données de la commande selon le format attendu par l'API
      const orderData = {
        type: OrderType.DELIVERY,
        address_id: addressId,
        phone: formatPhoneNumber(userData.phone),
        items: orderItems,
      };
      
      // Log complet des données envoyées au backend
      console.log("DONNÉES ENVOYÉES AU BACKEND (LIVRAISON):", JSON.stringify({
        orderData,
        cartItems: cartStore.items,
        userData,
        addressId
      }, null, 2));
      
      // Créer la commande
      const response = await createOrder(orderData);
      
      // Mettre à jour l'état
      set({ 
        currentOrderId: response.id,
        isLoading: false 
      });
      
      // Mettre à jour le store de livraison
      deliveryStore.setStep(DeliveryStep.CONFIRMATION);
      
      // Vider le panier après une commande réussie
      await cartStore.clearCart();
      
      return response.id;
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Erreur lors de la création de la commande' 
      });
      return null;
    }
  },

  /**
   * Crée une commande de type TAKEAWAY
   */
  createTakeawayOrder: async (
    fullname: string, 
    phone: string, 
    email: string, 
    note?: string,
    promoCode?: string
  ) => {
    try {
      set({ isLoading: true, error: null });
      
      // Récupérer l'état du panier et du store takeaway
      const cartStore = useCartStore.getState();
      const takeawayStore = useTakeawayStore.getState();
      
      // Vérifier si le panier est vide
      if (cartStore.items.length === 0) {
        throw new Error('Le panier est vide');
      }
      
      // Récupérer l'ID de l'utilisateur connecté
      const userData = await getCustomerDetails();
      if (!userData?.id) {
        throw new Error('Utilisateur non connecté');
      }
      
      // Vérifier que le numéro de téléphone est disponible
      if (!userData.phone) {
        throw new Error('Numéro de téléphone non disponible. Veuillez mettre à jour votre profil.');
      }

      // Gérer la date et l'heure de retrait
      let pickupDate = takeawayStore.selectedDate;
      let pickupTime = takeawayStore.selectedHour && takeawayStore.selectedMinute ? 
        `${takeawayStore.selectedHour}:${takeawayStore.selectedMinute}` : null;
      
      // Si aucune date n'est sélectionnée, utiliser la date du jour + 1 heure par défaut
      if (!pickupDate) {
        const today = new Date();
        // Format YYYY-MM-DD
        pickupDate = today.toISOString().split('T')[0];
        console.log("Aucune date sélectionnée, utilisation de la date du jour:", pickupDate);
      }
      
      // Si aucune heure n'est sélectionnée, utiliser l'heure actuelle + 1 heure par défaut
      if (!pickupTime) {
        const now = new Date();
        now.setHours(now.getHours() + 1); // Ajouter 1 heure
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        pickupTime = `${hours}:${minutes}`;
        console.log("Aucune heure sélectionnée, utilisation de l'heure actuelle + 1 heure:", pickupTime);
      }
      
      // Convertir les éléments du panier au format attendu par l'API
      const orderItems: OrderItem[] = cartStore.items.map(item => {
        // Récupérer les suppléments avec leurs IDs réels
        const supplementsIds = item.extras?.filter(extra => {
          // Vérifier si l'extra est un UUID valide (format attendu par l'API)
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          return uuidRegex.test(extra);
        });

        return {
          dish_id: item.id,
          quantity: item.quantity,
          // N'inclure supplements_ids que s'il y a des suppléments valides
          ...(supplementsIds && supplementsIds.length > 0 ? { supplements_ids: supplementsIds } : {})
        };
      });
      
      // Préparer les données de la commande selon le format attendu par l'API
      const orderData = {
        type: OrderType.PICKUP,
        phone: formatPhoneNumber(userData.phone),
        // Ajouter la date et l'heure de retrait
        date: pickupDate,
        time: pickupTime,
        items: orderItems,
        // Ajouter les champs optionnels s'ils sont fournis
        ...(note && { note }),
        ...(promoCode && { code_promo: promoCode }),
      };
      
      // Log complet des données envoyées au backend
      console.log("DONNÉES ENVOYÉES AU BACKEND (À EMPORTER):", JSON.stringify({
        orderData,
        cartItems: cartStore.items,
        userData
      }, null, 2));
      
      // Créer la commande
      const response = await createOrder(orderData);
      
      // Mettre à jour l'état
      set({ 
        currentOrderId: response.id,
        isLoading: false 
      });
      
      // Réinitialiser le store takeaway
      takeawayStore.reset();
      
      // Vider le panier après une commande réussie
      await cartStore.clearCart();
      
      return response.id;
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Erreur lors de la création de la commande' 
      });
      return null;
    }
  },

  /**
   * Réinitialise l'état du store
   */
  resetOrderState: () => {
    set({
      currentOrderId: null,
      error: null
    });
  }
}));

export default useOrderStore;
