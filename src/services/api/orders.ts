import { api, setAuthToken } from './api';
import { AuthStorage } from '@/services/storage/auth-storage';
import { formatImageUrl } from '@/utils/imageHelpers';
import { formatPhoneForAPI } from '@/utils/formatters';
import { CacheService } from '@/services/storage/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types d'ordre disponibles
export enum OrderType {
  DELIVERY = 'DELIVERY',
  PICKUP = 'PICKUP',
  TABLE = 'TABLE',
}

// Statuts possibles pour une commande
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  IN_PROGRESS = 'IN_PROGRESS',
  PICKED_UP = 'PICKED_UP'
}

// Interface pour un élément de commande
export interface OrderItem {
  dish_id: string;
  quantity: number;
  supplements_ids?: string[];
}

/**
 * Interface pour les données de création d'une commande
 */
export interface CreateOrderDto {
  type: OrderType;
  address: any; // Objet d'adresse complet
  items: OrderItem[];
  phone: string;
  table_type?: string;
  places?: number;
  date?: string;
  time?: string;
  fullname?: string;
  email?: string;
  note?: string;
  code_promo?: string;
}

// Interface pour la réponse de l'API après création d'une commande
export interface OrderResponse {
  id: string;
  type: OrderType;
  status: OrderStatus;
  total_amount: number;
  delivery_fee?: number;
  discount_amount?: number;
  final_amount: number;
  address?: {
    id: string;
    name: string;
    address: string;
    details?: string;
  };
  customer: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email?: string;
  };
  items?: Array<{
    id: string;
    dish: {
      id: string;
      name: string;
      price: number;
      image?: string;
    };
    quantity: number;
    supplements?: Array<{
      id: string;
      name: string;
      price: number;
    }>;
  }>;
  order_items?: Array<{
    id: string;
    quantity: number;
    amount: number;
    order_id: string;
    dish_id: string;
    supplements: any[];
    entity_status: string;
    created_at: string;
    updated_at: string;
    dish: {
      id: string;
      name: string;
      description: string;
      price: number;
      image: string;
      is_promotion: boolean;
      promotion_price: number | null;
      category_id: string;
      entity_status: string;
      created_at: string;
      updated_at: string;
    };
  }>;
  created_at: string;
  updated_at: string;
  reference?: string;
  customer_id?: string;
  note?: string;
  amount?: number;
  net_amount?: number;
  fullname?: string;
  phone?: string;
  email?: string;
}

// Créer un cache pour les commandes
const orderCache = new CacheService(5 * 60 * 1000);

/**
 * Crée une commande
 * @param orderData Données de la commande
 * @returns Réponse de l'API
 */
export const createOrder = async (orderData: CreateOrderDto): Promise<OrderResponse> => {
  try {
    // Récupérer le token d'authentification
    const authData = await AuthStorage.getAuthData();
    if (!authData?.accessToken) {
      throw new Error('Authentification requise pour passer une commande');
    }
    
    // S'assurer que le token est configuré dans les headers
    setAuthToken(authData.accessToken);
    
    // Créer une copie des données pour éviter de modifier l'original
    const cleanedOrderData = { ...orderData };
    
    // Si l'adresse est temporaire (localisation actuelle), la traiter correctement
    if (cleanedOrderData.address && cleanedOrderData.address.isTemporary) {
      try {
        const tempAddressJson = await AsyncStorage.getItem('temp_delivery_address');
        if (tempAddressJson) {
          const tempAddress = JSON.parse(tempAddressJson);
          
          // Ajouter les informations de localisation à la note de commande
          const locationNote = `Adresse: ${tempAddress.address}`;
          cleanedOrderData.note = cleanedOrderData.note 
            ? `${cleanedOrderData.note} - ${locationNote}` 
            : locationNote;
            
          // Utiliser l'objet d'adresse complet
          cleanedOrderData.address = tempAddress;
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'adresse temporaire:", error);
      }
    }
    
    if (cleanedOrderData.items && cleanedOrderData.items.length > 0) {
      // Pour les commandes PICKUP, supprimer tous les suppléments
      if (cleanedOrderData.type === 'PICKUP') {
        console.log('Commande PICKUP détectée: suppression de tous les suppléments');
        cleanedOrderData.items = cleanedOrderData.items.map(item => ({
          dish_id: item.dish_id,
          quantity: item.quantity
          // Pas de suppléments pour PICKUP
        }));
      } else {
        // Pour les autres types, filtrer les suppléments non valides
        cleanedOrderData.items = cleanedOrderData.items.map(item => {
          // Créer une copie de l'item
          const cleanedItem = { ...item };
          
          // Si des suppléments sont présents
          if (cleanedItem.supplements_ids && cleanedItem.supplements_ids.length > 0) {
            // Vérifier si les suppléments sont des UUIDs valides
            const validSupplements = cleanedItem.supplements_ids.filter(id => {
              const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
              return uuidRegex.test(id);
            });
            
            if (validSupplements.length === 0) {
              // Supprimer les suppléments si aucun n'est valide
              delete cleanedItem.supplements_ids;
            } else if (validSupplements.length !== cleanedItem.supplements_ids.length) {
              // Remplacer les suppléments par les UUIDs valides
              cleanedItem.supplements_ids = validSupplements;
            }
          }
          
          return cleanedItem;
        });
      }
    }

    if ('phone' in cleanedOrderData && cleanedOrderData.phone) {
      console.log('=== TRAITEMENT DU NUMÉRO DANS LE SERVICE API ===');
      console.log('NUMÉRO REÇU DANS LE SERVICE:', cleanedOrderData.phone);
      
      // Utiliser la fonction utilitaire pour assurer un formatage cohérent
      const phoneBeforeFormatting = cleanedOrderData.phone;
      cleanedOrderData.phone = formatPhoneForAPI(cleanedOrderData.phone);
      
      // Vérifier si le formatage a changé le numéro
      if (phoneBeforeFormatting !== cleanedOrderData.phone) {
        console.log('LE NUMÉRO A ÉTÉ MODIFIÉ PAR LE FORMATAGE');
        console.log('AVANT:', phoneBeforeFormatting);
        console.log('APRÈS:', cleanedOrderData.phone);
      } else {
        console.log('LE NUMÉRO N\'A PAS ÉTÉ MODIFIÉ PAR LE FORMATAGE');
      }
      
      // Log pour débogage
      console.log('NUMÉRO DE TÉLÉPHONE FINAL ENVOYÉ À L\'API:', cleanedOrderData.phone);
      console.log('LONGUEUR DU NUMÉRO FINAL:', cleanedOrderData.phone.length);
      console.log('=== FIN DU TRAITEMENT DU NUMÉRO ===');
    }

    // Envoyer la requête avec les données nettoyées
    const response = await api.post('/v1/orders', cleanedOrderData, {
      headers: {
        Authorization: `Bearer ${authData.accessToken}`
      }
    });

    console.log('Réponse backend:', response.data);

    // Invalider le cache des commandes
    await orderCache.invalidate('customer_orders');

    return response.data;
  } catch (error: any) {
    // Gérer les erreurs
    if (error.response) {
      // Afficher les erreurs de validation
      if (error.response.data?.errors) {
        // console.error('Erreur de validation:', error.response.data.errors);
      }
    }
    
    throw new Error(error?.response?.data?.message || 'Erreur lors de la création de la commande');
  }
};

/**
 * Crée une commande de type PICKUP (à emporter) avec un format minimal
 * Cette fonction utilise exactement le format attendu par le backend
 */
export const createPickupOrder = async (orderData: {
  type: OrderType;
  address: any; // Objet d'adresse complet
  items: { dish_id: string; quantity: number }[];
  phone: string;
  date?: string;
  time?: string;
  note?: string;
}): Promise<OrderResponse> => {
  try {
    // Récupérer le token d'authentification
    const authData = await AuthStorage.getAuthData();
    if (!authData?.accessToken) {
      throw new Error('Authentification requise pour passer une commande');
    }
    
    // S'assurer que le token est configuré dans les headers
    setAuthToken(authData.accessToken);
    
    // Envoyer la requête avec uniquement les champs nécessaires
    const response = await api.post('/v1/orders', orderData, {
      headers: {
        Authorization: `Bearer ${authData.accessToken}`
      }
    });
  
    // Invalider le cache des commandes
    await orderCache.invalidate('customer_orders');
    
    return response.data;
  } catch (error: any) {
    // Gérer les erreurs
    if (error.response) {
      // Afficher les erreurs de validation
      if (error.response.data?.errors) {
        // console.error('Erreur de validation:', error.response.data.errors);
      }
    }
    
    throw new Error(error?.response?.data?.message || 'Erreur lors de la création de la commande');
  }
};

/**
 * Crée une commande de type PICKUP (à emporter) avec un format exactement identique à l'exemple du backend
 */
export const createPickupOrderExact = async ({
  address,
  items,
  phone,
  date,
  time,
  note
}: {
  address: any; // Objet d'adresse complet
  items: { dish_id: string; quantity: number }[];
  phone: string;
  date?: string;
  time?: string;
  note?: string;
}): Promise<OrderResponse> => {
  try {
    // Récupérer le token d'authentification
    const authData = await AuthStorage.getAuthData();
    if (!authData?.accessToken) {
      throw new Error('Authentification requise pour passer une commande');
    }
    
    // S'assurer que le token est configuré dans les headers
    setAuthToken(authData.accessToken);
    
    // Créer l'objet avec l'adresse complète
    const exactOrderData = {
      type: 'PICKUP',
      address,
      phone,
      items,
      ...(date && { date }),
      ...(time && { time }),
      ...(note && { note })
    };
    
    // Envoyer la requête avec le format exact
    const response = await api.post('/v1/orders', exactOrderData, {
      headers: {
        Authorization: `Bearer ${authData.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Invalider le cache des commandes
    await orderCache.invalidate('customer_orders');
    
    return response.data;
  } catch (error: any) {
    // Gérer les erreurs
    if (error.response) {
      // Afficher les erreurs de validation
      if (error.response.config) {
        // console.error('Erreur de validation:', error.response.config);
      }
    }
    
    throw new Error(error?.response?.data?.message || 'Erreur lors de la création de la commande');
  }
};

/**
 * Crée une commande de type PICKUP en utilisant exactement le même format que DELIVERY
 */
export const createPickupOrderLikeDelivery = async (orderData: CreateOrderDto): Promise<OrderResponse> => {
  try {
    // Récupérer le token d'authentification
    const authData = await AuthStorage.getAuthData();
    if (!authData?.accessToken) {
      throw new Error('Authentification requise pour passer une commande');
    }
    
    // S'assurer que le token est configuré dans les headers
    setAuthToken(authData.accessToken);
    
    // Envoyer la requête
    const response = await api.post('/v1/orders', orderData);
    
    // Invalider le cache des commandes
    await orderCache.invalidate('customer_orders');
    
    return response.data;
  } catch (error: any) {
    // Gérer les erreurs
    if (error.response) {
      console.error('Erreur API:', error.response.data);
    }
    throw new Error(error?.response?.data?.message || 'Erreur lors de la création de la commande');
  }
};

/**
 * Crée une commande de type TABLE (réservation) en utilisant exactement le même format que DELIVERY
 */
export const createTableOrderLikeDelivery = async ({
  address,
  fullname,
  email,
  items,
  phone,
  date,
  time,
  table_type,
  places,
  note
}: {
  address: any; // Objet d'adresse complet
  fullname: string;
  email: string;
  items: { dish_id: string; quantity: number }[];
  phone: string;
  date: string;
  time: string;
  table_type: string;
  places: number;
  note?: string;
}): Promise<OrderResponse> => {
  try {
    // Récupérer le token d'authentification
    const authData = await AuthStorage.getAuthData();
    if (!authData?.accessToken) {
      throw new Error('Authentification requise pour passer une commande');
    }
    
    // S'assurer que le token est configuré dans les headers
    setAuthToken(authData.accessToken);
    
    // Créer l'objet avec l'adresse complète
    const exactOrderData = {
      type: 'TABLE',
      address,
      fullname,
      email,
      items,
      phone,
      date,
      time,
      table_type,
      places,
      ...(note && { note })
    };
    
    // Envoyer la requête avec le format exact
    const response = await api.post('/v1/orders', exactOrderData, {
      headers: {
        Authorization: `Bearer ${authData.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Invalider le cache des commandes
    await orderCache.invalidate('customer_orders');
    
    return response.data;
  } catch (error: any) {
    // Gérer les erreurs
    if (error.response) {
      // Afficher les erreurs de validation
      if (error.response.config) {
        // console.error('Erreur de validation:', error.response.config);
      }
    }
    
    throw new Error(error?.response?.data?.message || 'Erreur lors de la création de la commande');
  }
};

/**
 * Récupère les commandes d'un client
 * @param customerId ID du client (optionnel, utilise l'ID du client connecté si non fourni)
 * @param forceRefresh Force le rafraîchissement des données en ignorant le cache
 * @returns Liste des commandes du client
 */
export const getCustomerOrders = async (customerId?: string, forceRefresh: boolean = false): Promise<OrderResponse[]> => {
  try {
    // Récupérer le token d'authentification
    const authData = await AuthStorage.getAuthData();

    if (!authData?.accessToken) {
      throw new Error('Authentification requise pour récupérer les commandes');
    }

    // Configurer le token pour toutes les requêtes
    setAuthToken(authData.accessToken);

    // Récupérer l'ID du client connecté si non fourni
    if (!customerId) {
      const userData = await AuthStorage.getUserData();
      if (!userData?.id) {
        throw new Error('ID client non disponible');
      }
      customerId = userData.id;
    }

    // Vérifier le cache seulement si forceRefresh est false
    if (!forceRefresh) {
      const cacheKey = `customer_orders_${customerId}`;
      const cachedOrders = await orderCache.get(cacheKey);
      if (cachedOrders) {
        return cachedOrders;
      }
    }

    // Utiliser le bon endpoint
    const url = `v1/orders/customer`;

    // Envoyer la requête
    const response = await api.get(url, {
      headers: {
        'Authorization': `Bearer ${authData.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Extraire les données de la réponse
    const orders = response.data.data || response.data || [];

    // Formater les données si nécessaire
    const formattedOrders = Array.isArray(orders) 
      ? orders.map((order: any) => {
          if (order.items && Array.isArray(order.items)) {
            order.items = order.items.map((item: any) => {
              if (item.dish && item.dish.image) {
                item.dish.image = formatImageUrl(item.dish.image);
              }
              return item;
            });
          }
          return order;
        })
      : [];

    // Mettre en cache les résultats seulement si forceRefresh est false
    if (!forceRefresh) {
      const cacheKey = `customer_orders_${customerId}`;
      await orderCache.set(cacheKey, formattedOrders, true);
    }

    return formattedOrders;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Erreur lors de la récupération des commandes');
  }
};

/**
 * Récupère les détails d'une commande spécifique
 * @param orderId ID de la commande
 * @returns Détails de la commande
 */
export const getOrderById = async (orderId: string): Promise<OrderResponse> => {
  try {
    // Récupérer le token d'authentification
    const authData = await AuthStorage.getAuthData();
    if (!authData?.accessToken) {
      throw new Error('Authentification requise pour récupérer les détails de la commande');
    }

    // Vérifier le cache
    const cacheKey = `order_${orderId}`;
    const cachedOrder = await orderCache.get(cacheKey);
    if (cachedOrder) {
      return cachedOrder;
    }

    // Envoyer la requête
    const response = await api.get(`/v1/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${authData.accessToken}`
      }
    });

    // Extraire les données de la réponse
    const orderData = response.data.data || response.data;

    // Formater les images si présentes
    if (orderData.items && Array.isArray(orderData.items)) {
      orderData.items = orderData.items.map((item: any) => {
        if (item.dish && item.dish.image) {
          item.dish.image = formatImageUrl(item.dish.image);
        }
        return item;
      });
    }

    // Mettre en cache les résultats
    await orderCache.set(cacheKey, orderData, true);

    return orderData;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Erreur lors de la récupération des détails de la commande');
  }
};

/**
 * Annule une commande
 * @param orderId ID de la commande à annuler
 * @returns Résultat de l'opération
 */
export const cancelOrder = async (orderId: string): Promise<boolean> => {
  try {
    // Récupérer le token d'authentification
    const authData = await AuthStorage.getAuthData();
    if (!authData?.accessToken) {
      throw new Error('Authentification requise pour annuler une commande');
    }

    // Configurer le token pour toutes les requêtes
    setAuthToken(authData.accessToken);

    // Envoyer la requête DELETE avec les headers appropriés
    await api.delete(`/v1/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${authData.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Invalider le cache
    await orderCache.invalidate(`order_${orderId}`);
    await orderCache.invalidate('customer_orders');

    return true;
  } catch (error: any) {
    console.error('[CANCEL ORDER] Erreur:', error.response?.data || error.message);
    throw new Error(error?.response?.data?.message || 'Erreur lors de l\'annulation de la commande');
  }
};

/**
 * Filtre les commandes selon leur statut
 */
export const filterOrdersByStatus = (orders: OrderResponse[], status: (OrderStatus | string)[]): OrderResponse[] => {
  return orders.filter(order => status.includes(order.status));
};

/**
 * Filtre les commandes en cours
 */
export const getActiveOrders = (orders: OrderResponse[]): OrderResponse[] => {
  return filterOrdersByStatus(orders, [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.ACCEPTED,
    OrderStatus.PREPARING,
    OrderStatus.READY,
    'PENDING',
    'CONFIRMED',
    'ACCEPTED',
    'PREPARING',
    'READY'
  ]);
};

/**
 * Filtre les commandes terminées
 */
export const getCompletedOrders = (orders: OrderResponse[]): OrderResponse[] => {
  return filterOrdersByStatus(orders, [
    OrderStatus.DELIVERED,
    'DELIVERED'
  ]);
};

/**
 * Filtre les commandes annulées
 */
export const getCancelledOrders = (orders: OrderResponse[]): OrderResponse[] => {
  return filterOrdersByStatus(orders, [
    OrderStatus.CANCELLED,
    'CANCELLED'
  ]);
};

/**
 * Récupère le statut d'une commande spécifique
 * @param orderId ID de la commande
 * @returns Statut de la commande
 */
export const getOrderStatus = async (orderId: string): Promise<string> => {
  try {
    // Récupérer le token d'authentification
    const authData = await AuthStorage.getAuthData();
    if (!authData?.accessToken) {
      throw new Error('Authentification requise pour récupérer le statut de la commande');
    }

    // Envoyer la requête
    const response = await api.get(`/v1/orders/${orderId}/status`, {
      headers: {
        Authorization: `Bearer ${authData.accessToken}`
      }
    });

    return response.data.status;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Erreur lors de la récupération du statut de la commande');
  }
};
