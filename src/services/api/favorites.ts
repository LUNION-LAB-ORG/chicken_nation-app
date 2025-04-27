import { api } from './api';
import { formatMenuFromApi } from '../menuService';
import { MenuItem } from '@/types';

/**
 * Ajoute un menu aux favoris de l'utilisateur
 * @param dishId ID du plat à ajouter aux favoris
 * @returns true si l'ajout a réussi, false sinon
 */
export const addToFavorites = async (dishId: string): Promise<boolean> => {
  try {
    await api.post('/v1/favorites', { dish_id: dishId });
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Supprime un menu des favoris de l'utilisateur
 * @param dishId ID du plat à supprimer des favoris
 * @returns true si la suppression a réussi, false sinon
 */
export const removeFromFavorites = async (dishId: string): Promise<boolean> => {
  try {
    await api.delete(`/v1/favorites/${dishId}`);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Récupère tous les menus favoris de l'utilisateur
 * @returns Liste des menus favoris
 */
export const getUserFavorites = async (): Promise<MenuItem[]> => {
  try {
    const response = await api.get('/v1/favorites');
    
    // Vérifier si les données sont dans un champ 'data'
    const favorites = response.data.data || response.data || [];
    
    // Formater les menus pour correspondre au type MenuItem
    return Array.isArray(favorites) 
      ? favorites.map((favorite: any) => formatMenuFromApi(favorite.dish || favorite))
      : [];
  } catch (error) {
    return [];
  }
};

/**
 * Vérifie si un menu est dans les favoris de l'utilisateur
 * @param dishId ID du plat à vérifier
 * @returns true si le plat est dans les favoris, false sinon
 */
export const checkIsFavorite = async (dishId: string): Promise<boolean> => {
  try {
    const favorites = await getUserFavorites();
    return favorites.some(favorite => favorite.id === dishId);
  } catch (error) {
    return false;
  }
};
