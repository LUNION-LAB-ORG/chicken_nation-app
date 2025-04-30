import { api, setAuthToken } from './api';
import { AuthStorage } from '@/services/storage/auth-storage';
import { formatImageUrl } from '@/utils/imageHelpers';
import { CacheService } from '@/services/storage/storage';

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

// Interface pour la création d'une commande
export interface CreateOrderDto {
  type: OrderType;
  address_id?: string;
  code_promo?: string;
  date?: string;
  time?: string;
  fullname?: string;
  phone?: string;
  email?: string;
  note?: string;
  items: OrderItem[];
  customer_id?: string;
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
  items: Array<{
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
  created_at: string;
  updated_at: string;
}

// Cache pour les commandes avec une durée de 5 minutes
const orderCache = new CacheService(5 * 60 * 1000);

// Mappage des noms de suppléments vers leurs UUIDs
// À compléter avec les UUIDs réels des suppléments
const supplementsMapping: Record<string, string> = {
  "Cocoa Cola": "00000000-0000-0000-0000-000000000001", // UUID à remplacer par le vrai
  "Fanta 3": "00000000-0000-0000-0000-000000000002",    // UUID à remplacer par le vrai
  "Sandwich": "00000000-0000-0000-0000-000000000003",   // UUID à remplacer par le vrai
  // Ajouter d'autres mappages au besoin
};

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

/**
 * Crée une nouvelle commande
 * @param orderData Données de la commande
 * @returns Réponse de l'API avec les détails de la commande créée
 */
export const createOrder = async (orderData: CreateOrderDto): Promise<OrderResponse> => {
  try {
    // Récupérer le token d'authentification
    const authData = await AuthStorage.getAuthData();
    if (!authData?.accessToken) {
      throw new Error('Authentification requise pour passer une commande');
    }
    
    // S'assurer que le token est configuré dans les headers avant d'envoyer la requête
    setAuthToken(authData.accessToken);
    
    // Vérifier que le token est bien présent dans les headers
    console.log("=== TOKEN D'AUTHENTIFICATION ====");
    console.log(`Token présent: ${!!authData.accessToken}`);
    console.log(`Token configuré dans les headers: ${!!api.defaults.headers.common["Authorization"]}`);
    
    // Supprimer les suppléments qui ne sont pas au format UUID
    if (orderData.items && orderData.items.length > 0) {
      orderData.items.forEach(item => {
        // Si les suppléments sont présents
        if (item.supplements_ids && item.supplements_ids.length > 0) {
          // Supprimer complètement les suppléments pour éviter les erreurs
          console.log(`Suppression des suppléments pour l'article ${item.dish_id} pour éviter les erreurs`);
          delete item.supplements_ids;
        }
      });
    }

    // Formater le numéro de téléphone si présent
    if ('phone' in orderData && orderData.phone) {
      // Utiliser la fonction de formatage du numéro de téléphone
      orderData.phone = formatPhoneNumber(orderData.phone);
      
      console.log(`Numéro de téléphone formaté: ${orderData.phone}`);
    }

    console.log("=== DONNÉES FINALES ENVOYÉES À L'API ===");
    console.log(JSON.stringify(orderData, null, 2));

    // Envoyer la requête
    const response = await api.post('/v1/orders', orderData, {
      headers: {
        Authorization: `Bearer ${authData.accessToken}`
      }
    });

    console.log("=== RÉPONSE DE L'API ===");
    console.log(JSON.stringify(response.data, null, 2));

    // Invalider le cache des commandes
    await orderCache.invalidate('customer_orders');

    return response.data;
  } catch (error: any) {
    console.error("=== ERREUR DE L'API ===");
    console.error(JSON.stringify(error?.response?.data || error.message, null, 2));
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
