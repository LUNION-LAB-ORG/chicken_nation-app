import { API_URL } from '@/config';
import { MenuItem, Category } from '@/types';
import { api } from './api/api'; 
import { formatImageUrl } from '@/utils/imageHelpers';
import { API_ENDPOINTS } from '@/constants/menuConstants';
import { AuthStorage } from '@/services/storage/auth-storage';
import { CacheService } from '@/services/storage/storage';

// Types pour les menus
export interface Menu {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  restaurantId: string;
  image?: string;
  available?: boolean;
  supplements?: {
    ingredients?: SupplementItem[];
    accompagnements?: SupplementItem[];
    boissons?: SupplementItem[];
  };
}

export interface SupplementItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity?: number;
  category: string;
}

// Cache pour les menus avec une durée de 30 minutes
const menuCache = new CacheService(30 * 60 * 1000);

// Fonction pour transformer les données de menu de l'API au format attendu par l'interface MenuItem
export const formatMenuFromApi = (apiMenu: any): MenuItem => {
  // Formater les suppléments pour qu'ils correspondent à la structure attendue par l'UI
  const formattedSupplements = {};
  
  if (apiMenu.supplements && typeof apiMenu.supplements === 'object') {
    // L'API renvoie déjà les suppléments organisés par catégorie (FOOD, DRINK, ACCESSORY)
    Object.keys(apiMenu.supplements).forEach(category => {
      const items = apiMenu.supplements[category];
      
      if (Array.isArray(items)) {
        // Convertir le tableau en format attendu par l'UI
        formattedSupplements[category] = {
          items: items.map(item => ({
            id: item.id || `${category}-${item.name}`,
            name: item.name,
            price: (item.price || 0).toString() + ' FCFA',
          })),
          isIncluded: category === 'INGREDIENTS', // Les ingrédients sont généralement inclus
          required: false // Par défaut, pas obligatoire
        };
      }
    });
  }
  
  return {
    id: apiMenu.id || '',
    name: apiMenu.name || '',
    description: apiMenu.description || '',
    restaurant: apiMenu.restaurant_name || apiMenu.restaurant || '',
    restaurantId: apiMenu.restaurant_id || '',
    price: apiMenu.price?.toString() || '0',
    rating: apiMenu.rating || 0,
    categoryId: apiMenu.category_id || '',
    isAvailable: apiMenu.available !== false,
    isNew: apiMenu.is_new || false,
    ingredients: apiMenu.ingredients || [],
    image: formatImageUrl(apiMenu.image),
    supplements: Object.keys(formattedSupplements).length > 0 ? formattedSupplements : {},
    reviews: apiMenu.reviews || [],
    totalReviews: apiMenu.total_reviews || 0,
    discountedPrice: apiMenu.promotion_price?.toString(),
    originalPrice: apiMenu.price?.toString(),
    isPromotion: apiMenu.is_promotion || false
  };
};

// Fonction pour transformer les données de catégorie de l'API au format attendu
export const formatCategoryFromApi = (apiCategory: any): Category => {
  return {
    id: apiCategory.id || '',
    name: apiCategory.name || '',
    description: apiCategory.description || '',
    promo: apiCategory.promo || undefined,
    image: formatImageUrl(apiCategory.image)
  };
};

/**
 * Récupère le token d'authentification depuis le stockage
 * @returns Le token d'authentification
 * @throws Error si le token n'est pas trouvé
 */
const getAuthToken = async (): Promise<string> => {
  const authData = await AuthStorage.getAuthData();
  
  if (!authData || !authData.accessToken) {
    throw new Error('Authentication required');
  }
  
  return authData.accessToken;
};

// Récupérer tous les menus
export const getAllMenus = async (): Promise<MenuItem[]> => {
  try {
    // Vérifier d'abord le cache
    const cachedMenus = await menuCache.get('all_menus');
    if (cachedMenus) {
      return cachedMenus;
    }
    
    // Tenter de récupérer le token, mais ne pas exiger l'authentification
    let token = '';
    try {
      const authData = await AuthStorage.getAuthData();
      token = authData?.accessToken || '';
    } catch (authError) {
      // Continuer sans authentification
    }
    
    const response = await api.get(API_ENDPOINTS.DISHES, {
      headers: token ? {
        Authorization: `Bearer ${token}`
      } : {}
    });
    
    // Vérifier si les données sont dans un champ 'data'
    const menus = response.data.data || response.data || [];
    
    // Formater les menus pour correspondre au type MenuItem
    const formattedMenus = Array.isArray(menus) 
      ? menus.map((menu: any) => formatMenuFromApi(menu))
      : [];
    
    // Mettre en cache les résultats
    await menuCache.set('all_menus', formattedMenus, true);
    
    return formattedMenus;
  } catch (error) {
    // En cas d'erreur, retourner un tableau vide plutôt que de propager l'erreur
    return [];
  }
};

/**
 * Récupère un menu spécifique par son ID avec tous ses détails (restaurants, suppléments, etc.)
 * @param id - L'identifiant du menu à récupérer
 * @returns Le menu récupéré avec tous ses détails
 */
export const getMenuById = async (id: string): Promise<any> => {
  try {
    // Vérifier d'abord le cache
    const cacheKey = `menu_${id}`;
    const cachedMenu = await menuCache.get(cacheKey);
    if (cachedMenu) {
      return cachedMenu;
    }
    
    // Tenter de récupérer le token, mais ne pas exiger l'authentification
    let token = '';
    try {
      const authData = await AuthStorage.getAuthData();
      token = authData?.accessToken || '';
    } catch (authError) {
      // Continuer sans authentification
    }
    
    const response = await api.get(`${API_ENDPOINTS.DISHES}/${id}`, {
      headers: token ? {
        Authorization: `Bearer ${token}`
      } : {}
    });
    
    const menuData = response.data.data || response.data || null;
    
    // Si le menu existe, essayer de récupérer ses suppléments
    if (menuData && menuData.id) {
      try {
        const supplementsResponse = await api.get(`${API_ENDPOINTS.SUPPLEMENTS}?dish_id=${menuData.id}`, {
          headers: token ? {
            Authorization: `Bearer ${token}`
          } : {}
        });
        
        const supplementsData = supplementsResponse.data.data || supplementsResponse.data || {};
        
        // La réponse est déjà organisée par catégorie
        if (supplementsData && typeof supplementsData === 'object') {
          // Ajouter les suppléments au menu
          menuData.supplements = supplementsData;
        }
      } catch (suppError) {
        // Continuer avec le menu sans suppléments
      }
    }
    
    // Formater les données du menu avant de les mettre en cache
    const formattedMenu = menuData ? formatMenuFromApi(menuData) : null;
    
    // Mettre en cache les résultats
    if (formattedMenu) {
      await menuCache.set(cacheKey, formattedMenu, true);
    }
    
    return formattedMenu;
  } catch (error) {
    return null;
  }
};

// Récupérer toutes les catégories de menu
export const getAllMenuCategories = async (): Promise<Category[]> => {
  try {
    // Vérifier d'abord le cache
    const cachedCategories = await menuCache.get('menu_categories');
    if (cachedCategories) {
      console.log('Catégories récupérées depuis le cache');
      return cachedCategories;
    }
    
    const token = await getAuthToken();
    
    console.log(`Appel API: ${API_ENDPOINTS.MENU_CATEGORIES}`);
    const response = await api.get(API_ENDPOINTS.MENU_CATEGORIES, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Vérifier si les données sont dans un champ 'data'
    const categories = response.data.data || response.data || [];
    console.log(`Réponse API catégories:`, typeof categories, Array.isArray(categories) ? categories.length : 'non-array');
    
    // Formater les catégories pour correspondre au type Category
    const formattedCategories = Array.isArray(categories) 
      ? categories.map((category: any) => formatCategoryFromApi(category))
      : [];
    
    // Mettre en cache les résultats
    await menuCache.set('menu_categories', formattedCategories, true);
    
    return formattedCategories;
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories de plat:', error);
    // En cas d'erreur, retourner un tableau vide plutôt que de propager l'erreur
    return [];
  }
};
