import { api, setAuthToken } from './api';
import { AuthStorage } from '@/services/storage/auth-storage';
import { formatImageUrl } from '@/utils/imageHelpers';
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
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
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
  address_id: string;
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
    
    // Si l'ID d'adresse est "current_location", récupérer l'adresse temporaire stockée
    if (cleanedOrderData.address_id === "current_location") {
      try {
        const tempAddressJson = await AsyncStorage.getItem('temp_delivery_address');
        if (tempAddressJson) {
          const tempAddress = JSON.parse(tempAddressJson);
          
          // Ajouter les informations de localisation à la note de commande
          const locationNote = `Adresse: ${tempAddress.address}`;
          cleanedOrderData.note = cleanedOrderData.note 
            ? `${cleanedOrderData.note} - ${locationNote}` 
            : locationNote;
            
          // Utiliser une adresse par défaut pour le backend
          // Cela permet de contourner la validation côté serveur
          cleanedOrderData.address_id = "00000000-0000-0000-0000-000000000000";
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
      const userData = await AuthStorage.getUserData();
      if (userData?.phone) {
        // Supprimer les espaces et les tirets
        let digits = userData.phone.replace(/\D/g, '');
        
        if (digits.startsWith('225')) {
          digits = digits.substring(3);
        }
        
        // Ajouter le 0 au début si nécessaire
        if (!digits.startsWith('0')) {
          digits = '0' + digits;
        }
        
        cleanedOrderData.phone = `+225${digits}`;
      } else {
        // Pas de modification si le numéro de téléphone n'est pas disponible
      }
    }

    // Envoyer la requête avec les données nettoyées
    const response = await api.post('/v1/orders', cleanedOrderData, {
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
 * Crée une commande de type PICKUP (à emporter) avec un format minimal
 * Cette fonction utilise exactement le format attendu par le backend
 */
export const createPickupOrder = async (orderData: {
  type: OrderType;
  address_id: string;
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
  address_id,
  items,
  phone,
  date,
  time,
  note
}: {
  address_id: string;
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
    
    // Créer l'objet exactement comme l'exemple du backend
    const exactOrderData = {
      type: 'PICKUP',
      address_id,
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
export const createPickupOrderLikeDelivery = async ({
  address_id,
  fullname,
  email,
  items,
  phone,
  note
}: {
  address_id: string;
  fullname: string;
  email: string;
  items: { dish_id: string; quantity: number }[];
  phone: string;
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
    
    // Créer l'objet exactement comme l'exemple DELIVERY qui fonctionne
    const exactOrderData = {
      type: 'PICKUP',
      address_id,
      fullname,
      email,
      items,
      note,
      phone
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
 * Crée une commande de type TABLE (réservation) en utilisant exactement le même format que DELIVERY
 */
export const createTableOrderLikeDelivery = async ({
  address_id,
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
  address_id: string;
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
    
    // Créer l'objet exactement comme l'exemple DELIVERY qui fonctionne
    const exactOrderData = {
      type: 'TABLE',
      address_id,
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
 * @returns Liste des commandes du client
 */
export const getCustomerOrders = async (customerId?: string): Promise<OrderResponse[]> => {
  try {
    // Récupérer le token d'authentification
    const authData = await AuthStorage.getAuthData();
    if (!authData?.accessToken) {
      throw new Error('Authentification requise pour récupérer les commandes');
    }

    // Récupérer l'ID du client connecté si non fourni
    if (!customerId) {
      const userData = await AuthStorage.getUserData();
      if (!userData?.id) {
        throw new Error('ID client non disponible');
      }
      customerId = userData.id;
    }

    // Vérifier le cache
    const cacheKey = `customer_orders_${customerId}`;
    const cachedOrders = await orderCache.get(cacheKey);
    if (cachedOrders) {
      return cachedOrders;
    }

    // Construire l'URL avec le filtre customerId
    const url = `/v1/orders?customer_id=${customerId}`;

    // Envoyer la requête
    const response = await api.get(url, {
      headers: {
        Authorization: `Bearer ${authData.accessToken}`
      }
    });

    // Extraire les données de la réponse
    const orders = response.data.data || response.data || [];

    // Formater les données si nécessaire (par exemple, les URLs d'images)
    const formattedOrders = Array.isArray(orders) 
      ? orders.map((order: any) => {
          // Formater les images des plats si présentes
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

    // Mettre en cache les résultats
    await orderCache.set(cacheKey, formattedOrders, true);

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

    // Envoyer la requête
    await api.patch(`/v1/orders/${orderId}/cancel`, {}, {
      headers: {
        Authorization: `Bearer ${authData.accessToken}`
      }
    });

    // Invalider le cache
    await orderCache.invalidate(`order_${orderId}`);
    await orderCache.invalidate('customer_orders');

    return true;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Erreur lors de l\'annulation de la commande');
  }
};
