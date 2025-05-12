import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Clés de stockage pour l'application
 * Centralise toutes les clés utilisées dans AsyncStorage
 */
export const STORAGE_KEYS = {
  AUTH: {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_PHONE: 'user_phone',
  },
  USER: {
    PROFILE: 'user_profile',
    PREFERENCES: 'user_preferences',
  },
  CART: {
    ITEMS: 'cart_items',
    TOTAL: 'cart_total',
  },
  ORDER: {
    HISTORY: 'order_history',
    CURRENT: 'current_order',
  },
  APP: {
    LOCATION: 'location_data',
    SEARCH_HISTORY: 'search_history',
    ONBOARDING_COMPLETED: 'onboarding_completed',
    LAST_SYNC: 'last_sync_timestamp',
  },
};

export const storeData = async (key: string, value: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    
  } catch (error) {
    
    throw new Error(`Failed to store data for key: ${key}`);
  }
};

/**
 * Récupère des données depuis AsyncStorage
 * @param key Clé de stockage
 * @returns Données récupérées (parsées depuis JSON) ou null si non trouvées
 */
export const getData = async (key: string): Promise<any> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
   
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
 
    return null;
  }
};

/**
 * Supprime des données d'AsyncStorage
 * @param key Clé de stockage à supprimer
 */
export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
   
  } catch (error) {
    console.error('Error removing data:', error);
    
  }
};

/**
 * Efface toutes les données d'AsyncStorage
 * Utile pour la déconnexion ou la réinitialisation de l'application
 */
export const clearAll = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
   
  } catch (error) {
    
    throw new Error('Failed to clear storage');
  }
};

/**
 * Stocke plusieurs éléments à la fois dans AsyncStorage
 * @param keyValuePairs Tableau de paires clé-valeur à stocker
 */
export const storeMultiple = async (keyValuePairs: [string, any][]): Promise<void> => {
  try {
    const pairs = keyValuePairs.map(([key, value]) => [
      key,
      JSON.stringify(value),
    ]);
    await AsyncStorage.multiSet(pairs as [string, string][]);
    console.log(`Multiple items stored successfully`);
  } catch (error) {
    console.error('Error storing multiple items:', error);
    throw new Error('Failed to store multiple items');
  }
};

/**
 * Récupère plusieurs éléments à la fois depuis AsyncStorage
 * @param keys Tableau de clés à récupérer
 * @returns Objet avec les clés et valeurs récupérées
 */
export const getMultiple = async (keys: string[]): Promise<Record<string, any>> => {
  try {
    const pairs = await AsyncStorage.multiGet(keys);
    const result: Record<string, any> = {};
    
    pairs.forEach(([key, value]) => {
      if (value) {
        result[key] = JSON.parse(value);
      } else {
        result[key] = null;
      }
    });
    
    return result;
  } catch (error) {
    console.error('Error retrieving multiple items:', error);
    return {};
  }
};

/**
 * Service de cache pour les données fréquemment utilisées
 * Permet de réduire les appels réseau en mettant en cache les données
 */
export class CacheService {
  private memoryCache: Record<string, any> = {};
  private cacheDuration: number = 5 * 60 * 1000; // 5 minutes par défaut
  
  /**
   * Constructeur du service de cache
   * @param duration Durée de validité du cache en millisecondes (par défaut: 5 minutes)
   */
  constructor(duration?: number) {
    if (duration) {
      this.cacheDuration = duration;
    }
  }
  
  /**
   * Définit une valeur dans le cache
   * @param key Clé du cache
   * @param value Valeur à mettre en cache
   * @param persist Si true, stocke également dans AsyncStorage
   */
  async set(key: string, value: any, persist: boolean = false): Promise<void> {
    this.memoryCache[key] = {
      value,
      timestamp: Date.now(),
    };
    
    if (persist) {
      await storeData(key, value);
    }
  }
  
  /**
   * Récupère une valeur du cache
   * @param key Clé du cache
   * @param fetchFn Fonction à appeler si le cache est expiré ou vide
   * @param persist Si true, stocke le résultat de fetchFn dans AsyncStorage
   * @returns Valeur du cache ou résultat de fetchFn
   */
  async get(key: string, fetchFn?: () => Promise<any>, persist: boolean = false): Promise<any> {
    const cached = this.memoryCache[key];
    const now = Date.now();
    
    // Si le cache est valide et non expiré
    if (cached && now - cached.timestamp < this.cacheDuration) {
      return cached.value;
    }
    
    // Si fetchFn est fourni, l'appeler pour obtenir des données fraîches
    if (fetchFn) {
      try {
        const freshData = await fetchFn();
        await this.set(key, freshData, persist);
        return freshData;
      } catch (error) {
        console.error(`Error fetching fresh data for key: ${key}`, error);
        
        // En cas d'erreur, essayer de récupérer depuis AsyncStorage
        if (persist) {
          const storedData = await getData(key);
          if (storedData) {
            this.memoryCache[key] = {
              value: storedData,
              timestamp: now,
            };
            return storedData;
          }
        }
        
        throw error;
      }
    }
    
    // Si pas de fetchFn, essayer de récupérer depuis AsyncStorage
    if (persist) {
      const storedData = await getData(key);
      if (storedData) {
        this.memoryCache[key] = {
          value: storedData,
          timestamp: now,
        };
        return storedData;
      }
    }
    
    return null;
  }
  
  /**
   * Invalide une entrée du cache
   * @param key Clé du cache à invalider
   * @param removeFromStorage Si true, supprime également de AsyncStorage
   */
  async invalidate(key: string, removeFromStorage: boolean = false): Promise<void> {
    delete this.memoryCache[key];
    
    if (removeFromStorage) {
      await removeData(key);
    }
  }
  
  /**
   * Efface tout le cache
   * @param clearStorage Si true, efface également AsyncStorage
   */
  async clear(clearStorage: boolean = false): Promise<void> {
    this.memoryCache = {};
    
    if (clearStorage) {
      await clearAll();
    }
  }
}

// Exporte une instance par défaut du service de cache
export const defaultCache = new CacheService();