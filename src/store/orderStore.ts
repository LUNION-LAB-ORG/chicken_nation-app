import { create } from "zustand";
import { createOrder, getCustomerOrders, OrderResponse, OrderType, createPickupOrder, createPickupOrderExact, createPickupOrderLikeDelivery, createTableOrderLikeDelivery } from "@/services/api/orders";
import { getCustomerDetails } from "@/services/api/customer";
import useCartStore from "./cartStore";
import useTakeawayStore from "./takeawayStore";
import useDeliveryStore, { DeliveryStep } from "./deliveryStore";
import useReservationStore, { ReservationStep } from "./reservationStore";
import { AuthStorage } from "@/services/storage/auth-storage";
import useLocationStore from './locationStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRestaurantById, getAllRestaurants } from "@/services/restaurantService";
import { formatPhoneForAPI } from "@/utils/formatters";

interface OrderItem {
  dish_id: string;
  quantity: number;
  supplements_ids?: string[];
}

/**
 * Interface de base pour les données de commande
 */
interface BaseOrderData {
  type: OrderType;
  phone: string; // Rendu obligatoire pour correspondre à CreateOrderDto
  items: OrderItem[];
  note?: string;
  code_promo?: string;
  date?: string;
  time?: string;
  fullname?: string;
  email?: string;
  address: any; // Objet d'adresse complet
  table_type?: string; // Obligatoire pour les commandes TABLE
  places?: number;    // Optionnel pour les commandes TABLE
}

interface OrderState {
  orders: OrderResponse[];
  isLoading: boolean;
  currentOrderId: string | null;
  error: string | null;
  selectedRestaurantId: string | null;
  setSelectedRestaurantId: (id: string | null) => void;
  
  // Actions
  fetchOrders: (forceRefresh?: boolean) => Promise<void>;
  createGenericOrder: (orderData: BaseOrderData, resetStoreFunction?: () => void) => Promise<string | null>;
  createDeliveryOrder: (
    addressId: string, 
    fullname: string, 
    phone: string, 
    email: string, 
    note?: string,
    promoCode?: string,
    paymentId?: string
  ) => Promise<string | null>;
  createTakeawayOrder: (
    fullname: string, 
    phone: string, 
    email: string, 
    note?: string,
    promoCode?: string,
    paymentId?: string
  ) => Promise<string | null>;
  createTableOrder: (
    fullname: string,
    email: string,
    date: string,
    time: string,
    tableType: string,
    numberOfPeople: number,
    note?: string,
    promoCode?: string,
    paymentId?: string
  ) => Promise<string | null>;
  resetOrderState: () => void;
}

// Utilisation de la fonction utilitaire formatPhoneForAPI au lieu d'une implémentation locale
// Voir @/utils/formatters.ts pour l'implémentation

const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  isLoading: false,
  currentOrderId: null,
  error: null,
  selectedRestaurantId: null,
  setSelectedRestaurantId: (id) => set({ selectedRestaurantId: id }),

  /**
   * Récupère toutes les commandes de l'utilisateur
   */
  fetchOrders: async (forceRefresh: boolean = false) => {
    try {
      set({ isLoading: true, error: null });
      
      // Récupérer l'ID de l'utilisateur connecté
      const userData = await AuthStorage.getUserData();
      console.log('[ORDER STORE] User Data:', JSON.stringify(userData, null, 2));
      
      if (!userData?.id) {
        console.error('[ORDER STORE] Pas d\'ID utilisateur trouvé');
        throw new Error('Utilisateur non connecté');
      }
      
      console.log('[ORDER STORE] Tentative de récupération des commandes pour l\'utilisateur:', userData.id);
      
      // Récupérer les commandes avec l'option forceRefresh
      const orders = await getCustomerOrders(userData.id, forceRefresh);
      console.log('[ORDER STORE] Commandes reçues:', JSON.stringify(orders, null, 2));
      
      set({ orders, isLoading: false });
    } catch (error: any) {
      console.error('[ORDER STORE] Erreur détaillée:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
        headers: error.response?.headers
      });
      
      set({ 
        isLoading: false, 
        error: error.message || 'Erreur lors de la récupération des commandes' 
      });
    }
  },

  /**
   * Fonction générique pour créer une commande
   * @param orderData Données de base de la commande
   * @param resetStoreFunction Fonction de réinitialisation du store spécifique
   * @returns ID de la commande créée ou null en cas d'erreur
   */
  createGenericOrder: async (
    orderData: BaseOrderData,
    resetStoreFunction?: () => void
  ): Promise<string | null> => {
    try {
      set({ isLoading: true, error: null });
      
      // Récupérer l'état du panier
      const cartStore = useCartStore.getState();
      
      // Vérifier si le panier est vide
      if (cartStore.items.length === 0) {
        throw new Error('Le panier est vide');
      }
      
      // Récupérer les données utilisateur
      const userData = await getCustomerDetails();
      if (!userData?.id) {
        throw new Error('Utilisateur non connecté ou introuvable');
      }
      
      // Vérifier que le numéro de téléphone est disponible
      if (!userData.phone) {
        throw new Error('Numéro de téléphone non disponible. Veuillez mettre à jour votre profil.');
      }

      // Vérifier si une adresse est spécifiée, sinon utiliser la première adresse disponible
      if (!orderData.address && userData.addresses && userData.addresses.length > 0) {
        // Créer un objet d'adresse complet à partir de la première adresse de l'utilisateur
        const userAddress = userData.addresses[0];
        orderData.address = {
          title: userAddress.title || 'Adresse principale',
          address: userAddress.address,
          street: userAddress.street || '',
          city: userAddress.city || '',
          longitude: userAddress.longitude || 0,
          latitude: userAddress.latitude || 0
        };
      }
      
      // Vérifier que l'adresse est bien spécifiée (obligatoire pour tous les types)
      if (!orderData.address) {
        throw new Error('Une adresse est requise pour toutes les commandes. Veuillez ajouter une adresse à votre profil.');
      }
      
      // Vérifier si c'est une commande de type TABLE, le champ table_type est obligatoire
      if (orderData.type === OrderType.TABLE && !orderData.table_type) {
        throw new Error('Le type de table est requis pour les réservations.');
      }
      
      // Convertir les éléments du panier au format attendu par l'API
      const orderItems: OrderItem[] = cartStore.items.map(item => {
        // Récupérer les suppléments avec leurs IDs réels si disponibles
        const supplementsIds = item.extras?.filter(extra => {
          // Vérifier si l'extra est un UUID valide
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
      
      // Fusionner les données de base avec les items du panier et le téléphone formaté
      const finalOrderData = {
        ...orderData,
        phone: formatPhoneForAPI(userData.phone),
        items: orderItems,
      };
      
    
      // Créer la commande
      try {
      
        const response = await createOrder(finalOrderData);
       
        
        // Mettre à jour l'état
        set({ 
          currentOrderId: response.id,
          isLoading: false 
        });
        
        // Réinitialiser le store spécifique si fourni
        if (resetStoreFunction) {
          resetStoreFunction();
        }
        
        // Vider le panier après une commande réussie
        await cartStore.clearCart();
        
        return response.id;
      } catch (apiError: any) {
        console.error('Erreur API détaillée:', apiError);
        if (apiError.response) {
          console.error('Statut de l\'erreur:', apiError.response.status);
          console.error('Données de l\'erreur:', JSON.stringify(apiError.response.data, null, 2));
        }
        throw new Error(apiError?.response?.data?.message || apiError.message || 'Erreur lors de la communication avec le serveur');
      }
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Erreur lors de la création de la commande' 
      });
      return null;
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
    promoCode?: string,
    paymentId?: string
  ) => {
    console.log('=== DELIVERY ORDER ===');
    console.log('Payment ID:', paymentId);
    const authData = await AuthStorage.getAuthData();
    console.log('User Access Token:', authData?.accessToken);
    const deliveryStore = useDeliveryStore.getState();
    // Récupérer l'objet d'adresse complet depuis le store de localisation
    const { addressDetails, coordinates } = useLocationStore.getState();
    const addressObj = addressDetails && coordinates ? {
      ...addressDetails,
      longitude: coordinates.longitude,
      latitude: coordinates.latitude,
    } : undefined;

    const orderData: any = {
      type: OrderType.DELIVERY,
      address: addressObj,   // Objet d'adresse complet
      fullname,
      email,
      phone, // Ajouter le champ phone obligatoire
      items: [],
      ...(note && { note }),
      ...(promoCode && { code_promo: promoCode }),
      ...(paymentId && { paiement_id: paymentId })
    };
    
    console.log('Order Data:', JSON.stringify(orderData, null, 2));
    return get().createGenericOrder(
      orderData, 
      () => deliveryStore.setStep(DeliveryStep.CONFIRMATION)
    );
  },

  /**
   * Crée une commande de type PICKUP (à emporter)
   * Utilise exactement le même format que DELIVERY qui fonctionne
   */
  createTakeawayOrder: async (
    fullname: string, 
    phone: string, 
    email: string, 
    note?: string,
    promoCode?: string,
    paymentId?: string
  ) => {
    console.log('=== PICKUP ORDER ===');
    console.log('Payment ID:', paymentId);
    console.log('>>> createTakeawayOrder CALLED');
    const authData = await AuthStorage.getAuthData();
    console.log('User Access Token:', authData?.accessToken);
    try {
      set({ isLoading: true, error: null });
      
      const takeawayStore = useTakeawayStore.getState();
      const cartStore = useCartStore.getState();
      
      // Vérifier si le panier est vide
      if (cartStore.items.length === 0) {
        throw new Error('Le panier est vide');
      }
      
      // Récupérer les données utilisateur pour obtenir une adresse
      const userData = await getCustomerDetails();
      console.log('PICKUP - Données utilisateur:', userData);
      if (!userData?.id) {
        throw new Error('Utilisateur non connecté ou introuvable');
      }
      
      // Vérifier que le numéro de téléphone est disponible
      if (!userData.phone) {
        throw new Error('Numéro de téléphone non disponible. Veuillez mettre à jour votre profil.');
      }

      // Récupérer l'adresse depuis le locationStore (adresse actuelle de l'utilisateur)
      const { addressDetails, coordinates } = useLocationStore.getState();
      
      // Vérifier si nous avons des données de localisation
      let addressObj = null;
      
      if (addressDetails && coordinates) {
        addressObj = {
          ...addressDetails,
          longitude: coordinates.longitude,
          latitude: coordinates.latitude,
        };
      } else if (userData.addresses && userData.addresses.length > 0) {
        // Utiliser la première adresse de l'utilisateur comme fallback
        const userAddress = userData.addresses[0];
        addressObj = {
          title: userAddress.title || 'Adresse principale',
          address: userAddress.address,
          street: userAddress.street || '',
          city: userAddress.city || '',
          longitude: userAddress.longitude || 0,
          latitude: userAddress.latitude || 0
        };
      }

      if (!addressObj) {
        throw new Error('Aucune adresse disponible. Veuillez ajouter une adresse à votre profil.');
      }

      // Récupérer la date et l'heure de retrait depuis le store de type de commande
      let pickupDate = undefined;
      let pickupTime = undefined;
      try {
        const orderTypeStore = require('./orderTypeStore').default;
        const { reservationData } = orderTypeStore.getState();
        if (reservationData?.date) {
          // Format D/M/YYYY
          const d = reservationData.date instanceof Date ? reservationData.date : new Date(reservationData.date);
          pickupDate = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
        }
        if (reservationData?.time) {
          pickupTime = reservationData.time;
        }
      } catch (e) {
        // ignore si le store n'est pas dispo
      }

      console.log('PICKUP - Date envoyée au backend:', pickupDate);
      console.log('PICKUP - Heure envoyée au backend:', pickupTime);

      const orderData: any = {
        type: OrderType.PICKUP,
        address: addressObj,
        fullname,
        email,
        phone,
        items: [],
        ...(pickupDate && { date: pickupDate }),
        ...(pickupTime && { time: pickupTime }),
        ...(note && { note }),
        ...(promoCode && { code_promo: promoCode }),
        ...(paymentId && { paiement_id: paymentId })
      };
      
      console.log('Order Data:', JSON.stringify(orderData, null, 2));
      return get().createGenericOrder(
        orderData,
        () => takeawayStore.reset()
      );
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Erreur lors de la création de la commande' 
      });
      return null;
    }
  },

  /**
   * Crée une commande de type TABLE (réservation)
   * Utilise exactement le même format que DELIVERY qui fonctionne
   */
  createTableOrder: async (
    fullname: string,
    email: string,
    date: string,
    time: string,
    tableType: string,
    numberOfPeople: number,
    note?: string,
    promoCode?: string,
    paymentId?: string
  ): Promise<string | null> => {
    console.log('=== TABLE ORDER ===');
    console.log('Payment ID:', paymentId);
    const authData = await AuthStorage.getAuthData();
    console.log('User Access Token:', authData?.accessToken);
    try {
      set({ isLoading: true, error: null });
      
      const reservationStore = useReservationStore.getState();
      const cartStore = useCartStore.getState();
      const selectedRestaurantId = get().selectedRestaurantId;
      
      // Vérifier si le panier est vide
      if (cartStore.items.length === 0) {
        throw new Error('Le panier est vide');
      }
      
      // Vérifier si un restaurant est sélectionné
      if (!selectedRestaurantId) {
        throw new Error('Aucun restaurant sélectionné');
      }
      
      // Récupérer les détails du restaurant
      const restaurantDetails = await getRestaurantById(selectedRestaurantId);
      if (!restaurantDetails) {
        throw new Error('Restaurant introuvable');
      }
      
      // Récupérer les données utilisateur
      const userData = await getCustomerDetails();
      if (!userData?.id) {
        throw new Error('Utilisateur non connecté ou introuvable');
      }
      
      // Vérifier que le numéro de téléphone est disponible
      if (!userData.phone) {
        throw new Error('Numéro de téléphone non disponible. Veuillez mettre à jour votre profil.');
      }

      // Fonction utilitaire pour formater la date en D/M/YYYY
      const formatDateDMY = (input: string | Date): string => {
        const d = input instanceof Date ? input : new Date(input);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
      };

      // Formater la date et l'heure
      const formattedDate = formatDateDMY(date);
      const formattedTime = time;

      const orderData: any = {
        type: OrderType.TABLE,
        fullname,
        email,
        date: formattedDate,
        time: formattedTime,
        items: [],
        address: {
          title: restaurantDetails.name,
          address: restaurantDetails.address,
          street: restaurantDetails.address.split(',')[0] || '',
          city: restaurantDetails.address.split(',')[1]?.trim() || '',
          longitude: restaurantDetails.longitude || 0,
          latitude: restaurantDetails.latitude || 0,
          note: '',
        },
        restaurant_id: selectedRestaurantId,
        table_type: tableType,
        places: numberOfPeople,
        phone: userData.phone,
        ...(note && { note }),
        ...(promoCode && { code_promo: promoCode }),
        ...(paymentId && { paiement_id: paymentId })
      };
      
      console.log('Order Data:', JSON.stringify(orderData, null, 2));
      return get().createGenericOrder(
        orderData,
        () => reservationStore.completeReservation()
      );
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
