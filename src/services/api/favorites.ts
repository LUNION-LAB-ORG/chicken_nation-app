import { api } from './api';
import { formatMenuFromApi } from '../menuService';
import { MenuItem } from '@/types';

 
export const addToFavorites = async (dishId: string): Promise<boolean> => {
  try {
    await api.post('/v1/favorites', { dish_id: dishId });
    return true;
  } catch (error) {
    console.error(`[API Favoris] Erreur lors de l'ajout aux favoris:`, error);
    return false;
  }
};
 
export const removeFromFavorites = async (favoriteId: string): Promise<boolean> => {
  try {
    await api.delete(`/v1/favorites/${favoriteId}`);
    return true;
  } catch (error) {
    console.error(`[API Favoris] Erreur lors de la suppression du favori:`, error);
    return false;
  }
};
 
export const getUserFavorites = async (): Promise<MenuItem[]> => {
  try {
  
    const response = await api.get('/v1/favorites');
    
    // Vérifier si les données sont dans un champ 'data'
    const favorites = response.data.data || response.data || [];
    
    // Formater les menus pour correspondre au type MenuItem
    if (Array.isArray(favorites)) {
      return favorites.map((favorite: any) => {
        // Préserver l'ID du favori pour la suppression
        const menuItem = formatMenuFromApi(favorite.dish || favorite);
        
        // Ajouter l'ID du favori (important pour la suppression)
        if (favorite.id) {
          menuItem.favorite_id = favorite.id;
        }
        
        return menuItem;
      });
    } else {
      return [];
    }
  } catch (error) {
    console.error(`[API Favoris] Erreur lors de la récupération des favoris:`, error);
    return [];
  }
};

 
export const checkIsFavorite = async (dishId: string): Promise<boolean> => {
  try {
    const favorites = await getUserFavorites();
    return favorites.some(favorite => favorite.id === dishId);
  } catch (error) {
    return false;
  }
};