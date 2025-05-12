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
  fetchOrders: () => Promise<void>;
  createGenericOrder: (orderData: BaseOrderData, resetStoreFunction?: () => void) => Promise<string | null>;
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
  createTableOrder: (
    fullname: string,
    email: string,
    date: string,
    time: string,
    tableType: string,
    numberOfPeople: number,
    note?: string,
    promoCode?: string
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
  fetchOrders: async () => {
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
      
      // Récupérer les commandes (la fonction gère l'authentification en interne)
      const orders = await getCustomerOrders(userData.id);
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
    promoCode?: string
  ) => {
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
      ...(promoCode && { code_promo: promoCode })
    };
    
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
    promoCode?: string
  ) => {
    console.log('>>> createTakeawayOrder CALLED');
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
        // Utiliser l'adresse actuelle de l'utilisateur
        // Extraire les composants d'adresse à partir de l'adresse formatée
        const addressParts = (addressDetails.formattedAddress || addressDetails.address || "").split(',');
        const streetName = addressParts.length > 0 ? addressParts[0].trim() : "";
        const cityName = addressParts.length > 1 ? addressParts[1].trim() : "";
        
        addressObj = {
          title: addressDetails.title || "Adresse actuelle",
          address: addressDetails.formattedAddress || addressDetails.address || "Adresse actuelle",
          street: streetName,
          city: cityName,
          longitude: coordinates.longitude,
          latitude: coordinates.latitude,
          note: ""
        };
      } else if (userData?.addresses && userData.addresses.length > 0) {
        // Utiliser la première adresse de l'utilisateur comme fallback
        addressObj = {
          title: userData.addresses[0].title,
          address: userData.addresses[0].address,
          street: userData.addresses[0].street || "",
          city: userData.addresses[0].city || "",
          longitude: userData.addresses[0].longitude || 0,
          latitude: userData.addresses[0].latitude || 0,
          note: ""
        };
      } else {
        // Adresse par défaut si aucune information de localisation n'est disponible
        addressObj = {
          title: "Commande à emporter",
          address: "Retrait sur place",
          street: "",
          city: "",
          longitude: 0,
          latitude: 0,
          note: ""
        };
      }
      
      // Préparer les items au format minimal attendu par l'API
      const orderItems = cartStore.items.map(item => ({
        dish_id: item.id,
        quantity: item.quantity
        // Pas de suppléments pour PICKUP
      }));
      
      // Formater le numéro de téléphone avec la fonction utilitaire
      const formattedPhone = formatPhoneForAPI(userData.phone);
    
      // Récupérer le restaurant sélectionné
    let { selectedRestaurantId } = get();
    
    // Si aucun restaurant n'est sélectionné, on récupère dynamiquement un restaurant valide
    if (!selectedRestaurantId) {
      try {
        console.log('Aucun restaurant sélectionné, récupération d\'un restaurant valide...');
        
        // Récupérer la liste des restaurants disponibles
        const restaurants = await getAllRestaurants(1, 1); // Limiter à 1 restaurant pour optimiser
        
        if (restaurants && restaurants.length > 0) {
          // Utiliser le premier restaurant disponible
          selectedRestaurantId = restaurants[0].id;
          console.log('Restaurant récupéré depuis le service:', selectedRestaurantId);
        } else {
          // Si aucun restaurant n'est disponible, lancer une erreur
          throw new Error('Aucun restaurant disponible. Veuillez réessayer plus tard.');
        }
        
        // Mettre à jour l'ID du restaurant sélectionné dans le store
        set({ selectedRestaurantId });
      } catch (error) {
        console.error('Erreur lors de la récupération du restaurant:', error);
        throw new Error('Impossible de récupérer un restaurant. Veuillez réessayer plus tard.');
      }
    }
    
    console.log('PICKUP - Restaurant sélectionné:', selectedRestaurantId);

      const orderData: any = {
        type: OrderType.PICKUP,
        address: addressObj,
        fullname,
        email,
        items: orderItems,
        phone: formattedPhone,
        ...(note && { note }),
        ...(promoCode && { code_promo: promoCode })
      };
      // Le restaurant_id est obligatoire pour les commandes PICKUP
    if (!selectedRestaurantId) {
      throw new Error('Aucun restaurant sélectionné. Veuillez sélectionner un restaurant.');
    }
    orderData.restaurant_id = selectedRestaurantId;  
      console.log('PICKUP - Payload envoyé à l\'API:', orderData);
      
      // Utiliser la fonction qui fonctionne pour PICKUP
      const response = await createPickupOrderLikeDelivery(orderData);
      
      // Mettre à jour l'état
      set({ 
        currentOrderId: response.id,
        isLoading: false 
      });
      
      // Réinitialiser le store spécifique
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
    promoCode?: string
  ): Promise<string | null> => {
    try {
      set({ isLoading: true, error: null });
      
      const reservationStore = useReservationStore.getState();
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

      // Récupérer le restaurant sélectionné
      const { selectedRestaurantId } = get();
      if (!selectedRestaurantId) {
        throw new Error('Veuillez sélectionner un restaurant pour votre réservation.');
      }

      // Récupérer les détails du restaurant
      const restaurant = await getRestaurantById(selectedRestaurantId);
      if (!restaurant) {
        throw new Error('Restaurant non trouvé');
      }

      // Formater la date et l'heure
      let formattedDate = date;
      let formattedTime = time;
      
      if (date && !date.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const dateObj = new Date(date);
        formattedDate = dateObj.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
      
      if (time && !time.match(/^\d{2}:\d{2}$/)) {
        const match = time.match(/(\d{1,2})[:\s](\d{2})/);
        if (match) {
          const hours = match[1].padStart(2, '0');
          const minutes = match[2];
          formattedTime = `${hours}:${minutes}`;
        }
      }

      // Récupérer le restaurant sélectionné (si besoin)
      const { selectedRestaurantId: currentSelectedRestaurantId } = get();
      if (!currentSelectedRestaurantId) {
        throw new Error('Veuillez sélectionner un restaurant pour votre réservation.');
      }

      // Récupérer le restaurant sélectionné (si besoin)
      const { selectedRestaurantId: restaurantSelectedRestaurantId } = get();
      if (!restaurantSelectedRestaurantId) {
        throw new Error('Veuillez sélectionner un restaurant pour votre réservation.');
      }

      // Récupérer les détails du restaurant
      const restaurantDetails = await getRestaurantById(restaurantSelectedRestaurantId);
      if (!restaurantDetails) {
        throw new Error('Restaurant non trouvé');
      }

      // Récupérer l'adresse depuis le locationStore (adresse actuelle de l'utilisateur)
      const { addressDetails: userAddressDetails, coordinates: userCoordinates } = useLocationStore.getState();
      
      // Nous allons stocker l'adresse de l'utilisateur pour des calculs ultérieurs
      // mais nous utiliserons toujours l'adresse du restaurant pour l'adresse de la commande
      let userAddressObj = null;
      
      if (userAddressDetails && userCoordinates) {
        // Utiliser l'adresse actuelle de l'utilisateur
        // Extraire les composants d'adresse à partir de l'adresse formatée
        const addressParts = (userAddressDetails.formattedAddress || userAddressDetails.address || "").split(',');
        const streetName = addressParts.length > 0 ? addressParts[0].trim() : "";
        const cityName = addressParts.length > 1 ? addressParts[1].trim() : "";
        
        userAddressObj = {
          title: userAddressDetails.title || "Adresse actuelle",
          address: userAddressDetails.formattedAddress || userAddressDetails.address || "Adresse actuelle",
          street: streetName,
          city: cityName,
          longitude: userCoordinates.longitude,
          latitude: userCoordinates.latitude,
          note: ""
        };
      } else if (userData?.addresses && userData.addresses.length > 0) {
        // Utiliser la première adresse de l'utilisateur comme fallback
        userAddressObj = {
          title: userData.addresses[0].title,
          address: userData.addresses[0].address,
          street: userData.addresses[0].street || "",
          city: userData.addresses[0].city || "",
          longitude: userData.addresses[0].longitude || 0,
          latitude: userData.addresses[0].latitude || 0,
          note: ""
        };
      }
      
      // Stocker l'adresse de l'utilisateur dans AsyncStorage pour une utilisation ultérieure
      if (userAddressObj) {
        try {
          await AsyncStorage.setItem('user_location_for_calculations', JSON.stringify(userAddressObj));
        } catch (error) {
          console.error('Erreur lors de la sauvegarde de la localisation utilisateur:', error);
        }
      }
      
      // Préparer les items au format minimal attendu par l'API
      const orderItems = cartStore.items.map(item => ({
        dish_id: item.id,
        quantity: item.quantity
        // Pas de suppléments pour TABLE
      }));
      
      // Formater le numéro de téléphone avec la fonction utilitaire
      const formattedPhone = formatPhoneForAPI(userData.phone);
      
      // Construire l'objet address complet pour le backend
      const addressObj = {
        title: restaurantDetails.name,
        address: restaurantDetails.address,
        street: restaurantDetails.address.split(',')[0] || '',
        city: restaurantDetails.address.split(',')[1]?.trim() || '',
        longitude: restaurantDetails.longitude || 0,
        latitude: restaurantDetails.latitude || 0,
        note: '',
      };

      const orderData: any = {
        type: OrderType.TABLE,
        fullname,
        email,
        date: formattedDate,
        time: formattedTime,
        items: orderItems,
        address: addressObj,              // Objet complet JSON
        restaurant_id: selectedRestaurantId,
        table_type: tableType,
        places: numberOfPeople,
        phone: formattedPhone,
        ...(note && { note }),
        ...(promoCode && { code_promo: promoCode })
      };
      
      console.log('Payload TABLE:', orderData);
      const response = await createOrder(orderData);
      
      // Mettre à jour l'état
      set({ 
        currentOrderId: response.id,
        isLoading: false 
      });
      
      // Réinitialiser le store spécifique
      reservationStore.completeReservation();
      
      // Vider le panier après une commande réussie
      await cartStore.clearCart();
      
      return response.id;
    } catch (error: any) {
      console.error("Erreur lors de la création de la commande TABLE:", error);
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
