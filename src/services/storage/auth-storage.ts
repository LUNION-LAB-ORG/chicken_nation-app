import { storeData, getData, removeData, STORAGE_KEYS } from './storage';
import { User } from '@/app/context/AuthContext';

/**
 * Interface pour les données d'authentification
 */
export interface AuthData {
  accessToken: string;
  refreshToken: string;
  phone?: string;
}

/**
 * Service de stockage pour l'authentification
 * Fournit des méthodes spécifiques pour gérer les données d'authentification
 */
export const AuthStorage = {
  /**
   * Stocke les tokens d'authentification
   * @param accessToken Token d'accès
   * @param refreshToken Token de rafraîchissement
   * @param phone Numéro de téléphone (optionnel)
   */
  async storeTokens(accessToken: string, refreshToken: string, phone?: string): Promise<void> {
    try {
      await storeData(STORAGE_KEYS.AUTH.ACCESS_TOKEN, accessToken);
      await storeData(STORAGE_KEYS.AUTH.REFRESH_TOKEN, refreshToken);
      if (phone) {
        await storeData(STORAGE_KEYS.AUTH.USER_PHONE, phone);
      }
      console.log('Auth tokens stored successfully');
    } catch (error) {
      console.error('Error storing auth tokens:', error);
      throw new Error('Failed to store authentication tokens');
    }
  },

  /**
   * Stocke les données utilisateur
   * @param userData Données utilisateur à stocker
   */
  async storeUserData(userData: User): Promise<void> {
    try {
      await storeData(STORAGE_KEYS.USER.PROFILE, userData);
      console.log('User data stored successfully');
    } catch (error) {
      console.error('Error storing user data:', error);
      throw new Error('Failed to store user data');
    }
  },

  /**
   * Récupère les données utilisateur
   * @returns Données utilisateur ou null si non trouvées
   */
  async getUserData(): Promise<User | null> {
    try {
      const userData = await getData(STORAGE_KEYS.USER.PROFILE);
      return userData as User | null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  },

  /**
   * Récupère les données d'authentification
   * @returns Données d'authentification ou null si non trouvées
   */
  async getAuthData(): Promise<AuthData | null> {
    try {
      const accessToken = await getData(STORAGE_KEYS.AUTH.ACCESS_TOKEN);
      const refreshToken = await getData(STORAGE_KEYS.AUTH.REFRESH_TOKEN);
      const phone = await getData(STORAGE_KEYS.AUTH.USER_PHONE);

      if (!accessToken || !refreshToken) {
        return null;
      }

      return {
        accessToken,
        refreshToken,
        phone: phone || undefined
      };
    } catch (error) {
      console.error('Error retrieving auth data:', error);
      return null;
    }
  },

  /**
   * Vérifie si l'utilisateur est authentifié
   * @returns true si l'utilisateur est authentifié, false sinon
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const accessToken = await getData(STORAGE_KEYS.AUTH.ACCESS_TOKEN);
      return !!accessToken;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  },

  /**
   * Supprime les données d'authentification (déconnexion)
   */
  async clearAuthData(): Promise<void> {
    try {
      await removeData(STORAGE_KEYS.AUTH.ACCESS_TOKEN);
      await removeData(STORAGE_KEYS.AUTH.REFRESH_TOKEN);
      await removeData(STORAGE_KEYS.AUTH.USER_PHONE);
      await removeData(STORAGE_KEYS.USER.PROFILE);
      console.log('Auth data cleared successfully');
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw new Error('Failed to clear authentication data');
    }
  },

  /**
   * Récupère le token d'accès
   * @returns Token d'accès ou null si non trouvé
   */
  async getAccessToken(): Promise<string | null> {
    return getData(STORAGE_KEYS.AUTH.ACCESS_TOKEN);
  },

  /**
   * Récupère le token de rafraîchissement
   * @returns Token de rafraîchissement ou null si non trouvé
   */
  async getRefreshToken(): Promise<string | null> {
    return getData(STORAGE_KEYS.AUTH.REFRESH_TOKEN);
  },

  /**
   * Récupère le numéro de téléphone de l'utilisateur
   * @returns Numéro de téléphone ou null si non trouvé
   */
  async getUserPhone(): Promise<string | null> {
    return getData(STORAGE_KEYS.AUTH.USER_PHONE);
  }
};
