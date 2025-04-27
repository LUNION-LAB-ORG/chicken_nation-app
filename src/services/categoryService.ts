/**
 * Service pour la gestion des catégories
 */

import { api } from './api/api'; 
import { formatImageUrl } from '@/utils/imageHelpers';
import { MenuItem } from '@/types';
import { CacheService } from './storage/storage';  

// Points d'entrée de l'API pour les catégories
// Correction de l'endpoint pour utiliser le bon chemin
const CATEGORIES_ENDPOINT = '/v1/categories';

// Service de cache pour les catégories
const categoryCache = new CacheService('categories', 30); // Cache de 30 minutes

/**
 * Interface pour les catégories selon la documentation Swagger
 */
export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  productCount?: number; // Champ ajouté pour l'affichage dans l'interface
}

/**
 * Interface pour la réponse de l'API pour une catégorie avec ses plats
 */
export interface CategoryWithDishes extends Category {
  dishes: MenuItem[];
}

/**
 * Récupère toutes les catégories
 */
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    // Vider le cache pour forcer une nouvelle requête
    await categoryCache.invalidate('all', true); 
    
    // Vérifier si les données sont en cache (ne devrait pas arriver après le vidage)
    const cachedData = await categoryCache.get('all');
    if (cachedData) {
      return cachedData;
    }

    const apiResponse = await api.get(CATEGORIES_ENDPOINT, false);
    
    // Extraire les données de la réponse
    const responseData = apiResponse.data;
    const categoriesData = responseData && responseData.data ? responseData.data : 
                          (Array.isArray(responseData) ? responseData : []);
    
    if (!Array.isArray(categoriesData)) {
      throw new Error('Format de réponse inattendu pour les catégories');
    }
    
    // Formater les images si nécessaire
    const formattedCategories: Category[] = categoriesData.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      image: category.image ? formatImageUrl(category.image) : undefined,
      productCount: category.productCount
    }));
    
    // Mettre en cache les données
    await categoryCache.set('all', formattedCategories);
    
    return formattedCategories;
  } catch (error) {
    throw error;
  }
};

/**
 * Récupère une catégorie par son ID
 * @param id - L'ID de la catégorie
 */
export const getCategoryById = async (id: string): Promise<Category> => {
  try {
    // Vérifier si les données sont en cache
    const cachedData = await categoryCache.get(`category-${id}`);
    if (cachedData) {
      return cachedData;
    }

    const apiResponse = await api.get(`${CATEGORIES_ENDPOINT}/${id}`, false);
    
    // Extraire les données de la réponse
    const categoryData = apiResponse.data.data || apiResponse.data;
    
    if (!categoryData || !categoryData.id) {
      throw new Error(`Catégorie ${id} non trouvée`);
    }
    
    // Formater l'image si nécessaire
    const formattedCategory: Category = {
      id: categoryData.id,
      name: categoryData.name,
      description: categoryData.description,
      image: categoryData.image ? formatImageUrl(categoryData.image) : undefined,
      productCount: categoryData.productCount
    };
    
    // Mettre en cache les données
    await categoryCache.set(`category-${id}`, formattedCategory);
    
    return formattedCategory;
  } catch (error) {
    throw error;
  }
};

/**
 * Récupère une catégorie avec ses plats
 * @param categoryId - L'ID de la catégorie
 */
export const getCategoryWithDishes = async (categoryId: string): Promise<CategoryWithDishes> => {
  try {
    // Vérifier si les données sont en cache
    const cachedData = await categoryCache.get(`category-dishes-${categoryId}`);
    if (cachedData) {
      return cachedData;
    }

    const response = await api.get<CategoryWithDishes>(`${CATEGORIES_ENDPOINT}/${categoryId}`, true);
    
    const formattedResponse: CategoryWithDishes = {
      ...response as CategoryWithDishes,
      dishes: [],
      image: response.image ? formatImageUrl(response.image) : undefined
    };
    
    if (response && (response as CategoryWithDishes).dishes && Array.isArray((response as CategoryWithDishes).dishes)) {
      formattedResponse.dishes = (response as CategoryWithDishes).dishes.map((dish: any) => ({
        ...dish,
        image: formatImageUrl(dish.image)
      }));
    }
    
    // Mettre en cache les données
    await categoryCache.set(`category-dishes-${categoryId}`, formattedResponse);
    
    return formattedResponse;
  } catch (error) {
    throw error;
  }
};

/**
 * Récupère les plats d'une catégorie spécifique
 * @param categoryId - L'ID de la catégorie
 */
export const getMenusByCategoryId = async (categoryId: string): Promise<MenuItem[]> => {
  try {
    // Vérifier si les données sont en cache
    const cachedData = await categoryCache.get(`menus-category-${categoryId}`);
    if (cachedData) {
      return cachedData;
    }

    const response = await api.get<CategoryWithDishes>(`${CATEGORIES_ENDPOINT}/${categoryId}`, true);
    
    let formattedDishes: MenuItem[] = [];
    
    if (response && response.dishes && Array.isArray(response.dishes)) {
      formattedDishes = response.dishes.map(dish => ({
        ...dish,
        image: formatImageUrl(dish.image)
      }));
      
      // Mettre en cache les données
      await categoryCache.set(`menus-category-${categoryId}`, formattedDishes);
    }
    
    return formattedDishes;
  } catch (error) {
    throw error;
  }
};
