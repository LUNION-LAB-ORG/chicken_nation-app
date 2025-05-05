import { create } from "zustand";
import { createOrder, getCustomerOrders, OrderResponse, OrderType, createPickupOrder, createPickupOrderExact, createPickupOrderLikeDelivery, createTableOrderLikeDelivery } from "@/services/api/orders";
import { getCustomerDetails } from "@/services/api/customer";
import useCartStore from "./cartStore";
import useTakeawayStore from "./takeawayStore";
import useDeliveryStore, { DeliveryStep } from "./deliveryStore";
import useReservationStore, { ReservationStep } from "./reservationStore";
import { AuthStorage } from "@/services/storage/auth-storage";

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
  address_id: string; // Obligatoire pour tous les types selon le backend
  table_type?: string; // Obligatoire pour les commandes TABLE
  places?: number;    // Optionnel pour les commandes TABLE
}

interface OrderState {
  orders: OrderResponse[];
  isLoading: boolean;
  currentOrderId: string | null;
  error: string | null;
  
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
    note?: string
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
      if (!orderData.address_id && userData.addresses && userData.addresses.length > 0) {
        orderData.address_id = userData.addresses[0].id;
      
      }
      
      // Vérifier que l'adresse est bien spécifiée (obligatoire pour tous les types selon le backend)
      if (!orderData.address_id) {
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
        phone: formatPhoneNumber(userData.phone),
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
    
    const orderData: BaseOrderData = {
      type: OrderType.DELIVERY,
      address_id: addressId,
      fullname,
      email,
      phone, // Ajouter le champ phone obligatoire
      items: [],
      ...(note && { note }),
      ...(promoCode && { code_promo: promoCode }),
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
    try {
      set({ isLoading: true, error: null });
      
      const takeawayStore = useTakeawayStore.getState();
      const cartStore = useCartStore.getState();
      
      // Vérifier si le panier est vide
      if (cartStore.items.length === 0) {
        throw new Error('Le panier est vide');
      }
      
      // Gérer la date et l'heure de retrait
      let pickupDate = takeawayStore.selectedDate;
      let pickupTime = takeawayStore.selectedHour && takeawayStore.selectedMinute ? 
        `${takeawayStore.selectedHour}:${takeawayStore.selectedMinute}` : null;
      
      // Valeurs par défaut si non sélectionnées
      if (!pickupDate) {
        const today = new Date();
        pickupDate = today.toISOString().split('T')[0];
      }
      
      if (!pickupTime) {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        pickupTime = `${hours}:${minutes}`;
      }
      
      // Récupérer les données utilisateur pour obtenir une adresse
      const userData = await getCustomerDetails();
      if (!userData?.id) {
        throw new Error('Utilisateur non connecté ou introuvable');
      }
      
      // Vérifier que le numéro de téléphone est disponible
      if (!userData.phone) {
        throw new Error('Numéro de téléphone non disponible. Veuillez mettre à jour votre profil.');
      }

      // Trouver une adresse par défaut si disponible
      let defaultAddressId = null;
      if (userData?.addresses && userData.addresses.length > 0) {
        defaultAddressId = userData.addresses[0].id;
      }
      
      // Vérifier qu'une adresse est disponible
      if (!defaultAddressId) {
        throw new Error('Une adresse est requise pour les commandes à emporter. Veuillez ajouter une adresse à votre profil.');
      }
      
      // Préparer les items au format minimal attendu par l'API
      const orderItems = cartStore.items.map(item => ({
        dish_id: item.id,
        quantity: item.quantity
        // Pas de suppléments pour PICKUP
      }));
      
      // Formater le numéro de téléphone
      const formattedPhone = formatPhoneNumber(userData.phone);
    
      
      // Utiliser la fonction qui reproduit exactement le format de DELIVERY qui fonctionne
      const response = await createPickupOrderLikeDelivery({
        address_id: defaultAddressId,
        fullname,
        email,
        items: orderItems,
        phone: formattedPhone,
        note
      });
      
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
  ) => {
    try {
      
      
      set({ isLoading: true, error: null });
      
      const reservationStore = useReservationStore.getState();
      const cartStore = useCartStore.getState();
      
    
      // Vérifier si le panier est vide
      if (cartStore.items.length === 0) {
        throw new Error('Le panier est vide');
      }
      
      // Récupérer les données utilisateur pour obtenir une adresse
      const userData = await getCustomerDetails();
      if (!userData?.id) {
        throw new Error('Utilisateur non connecté ou introuvable');
      }
      
      // Vérifier que le numéro de téléphone est disponible
      if (!userData.phone) {
        throw new Error('Numéro de téléphone non disponible. Veuillez mettre à jour votre profil.');
      }

      // Trouver une adresse par défaut si disponible
      let defaultAddressId = null;
      if (userData?.addresses && userData.addresses.length > 0) {
        defaultAddressId = userData.addresses[0].id;
     
      }
      
      // Vérifier qu'une adresse est disponible
      if (!defaultAddressId) {
        throw new Error('Une adresse est requise pour les réservations. Veuillez ajouter une adresse à votre profil.');
      }
      
      // Préparer les items au format minimal attendu par l'API
      const orderItems = cartStore.items.map(item => ({
        dish_id: item.id,
        quantity: item.quantity
        // Pas de suppléments pour TABLE
      }));
      
      // Formater le numéro de téléphone
      const formattedPhone = formatPhoneNumber(userData.phone);
      
      // Essayer une approche différente : utiliser directement createOrder avec le type TABLE
      try {
     
        
        // Vérifier et formater correctement les données pour l'API
        if (!date || !time || !tableType) {
          console.error("Données de réservation incomplètes:", { date, time, tableType });
          throw new Error("Les informations de réservation sont incomplètes. Veuillez renseigner la date, l'heure et le type de table.");
        }
        
        // Vérifier que le type de table est valide
        const validTableTypes = ["TABLE_SQUARE", "TABLE_RECTANGLE", "TABLE_ROUND"];
        if (!validTableTypes.includes(tableType)) {
          console.error("Type de table invalide:", tableType);
          throw new Error(`Type de table invalide. Les valeurs acceptées sont: ${validTableTypes.join(", ")}`);
        }
        
        // Formater la date et l'heure pour l'API
        let formattedDate = date;
        let formattedTime = time;
        
        // Formater la date au format JJ/MM/AAAA si elle n'est pas déjà dans ce format
        if (date && !date.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          try {
            const dateObj = new Date(date);
            formattedDate = dateObj.toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
          } catch (error) {
            console.error("Erreur lors du formatage de la date:", error);
            throw new Error("Format de date invalide. Utilisez le format JJ/MM/AAAA.");
          }
        }
        
        // Formater l'heure au format HH:mm si elle n'est pas déjà dans ce format
        if (time && !time.match(/^\d{2}:\d{2}$/)) {
          try {
            // Extraire les heures et minutes si possible
            const match = time.match(/(\d{1,2})[:\s](\d{2})/);
            if (match) {
              const hours = match[1].padStart(2, '0');
              const minutes = match[2];
              formattedTime = `${hours}:${minutes}`;
            } else {
              throw new Error("Format d'heure non reconnu");
            }
          } catch (error) {
            console.error("Erreur lors du formatage de l'heure:", error);
            throw new Error("Format d'heure invalide. Utilisez le format HH:mm.");
          }
        }
        
        const orderData: BaseOrderData = {
          type: OrderType.TABLE,
          fullname,
          email,
          date: formattedDate,
          time: formattedTime,
          items: orderItems,
          address_id: defaultAddressId,
          table_type: tableType,
          places: numberOfPeople,
          phone: formattedPhone,
          ...(note && { note })
        };
        
  
        
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
      } catch (directError: any) {
       
        
        // Formater la date et l'heure pour l'API
        let formattedDate = date;
        let formattedTime = time;
        
        // Formater la date au format JJ/MM/AAAA
        if (date && !date.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          try {
            const dateObj = new Date(date);
            formattedDate = dateObj.toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
          } catch (error) {
            console.error("Erreur lors du formatage de la date dans le bloc catch:", error);
            // Continuer avec la valeur originale
          }
        }
        
        // Formater l'heure au format HH:mm
        if (time && !time.match(/^\d{2}:\d{2}$/)) {
          try {
            const match = time.match(/(\d{1,2})[:\s](\d{2})/);
            if (match) {
              const hours = match[1].padStart(2, '0');
              const minutes = match[2];
              formattedTime = `${hours}:${minutes}`;
            }
          } catch (error) {
            console.error("Erreur lors du formatage de l'heure dans le bloc catch:", error);
            // Continuer avec la valeur originale
          }
        }
        
        // Préparer les données de commande avec les formats corrects
        const orderData = {
          address_id: defaultAddressId,
          fullname,
          email,
          items: orderItems,
          phone: formattedPhone,
          date: formattedDate,
          time: formattedTime,
          table_type: tableType,
          places: numberOfPeople,
          note
        };
        
       
        
        // Utiliser la fonction qui reproduit exactement le format de DELIVERY qui fonctionne
        const response = await createTableOrderLikeDelivery(orderData);
        
      
     
        
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
      }
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
