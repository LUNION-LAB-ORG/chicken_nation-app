import { create } from "zustand";
import { AuthStorage, AuthData } from "@/services/storage/auth-storage";

/**
 * Interface pour l'u00e9tat d'authentification
 */
interface AuthState {
  // u00c9tat
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  userPhone: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (accessToken: string, refreshToken: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
  setError: (error: string | null) => void;
}

/**
 * Store Zustand pour gu00e9rer l'u00e9tat d'authentification
 * Combine Zustand pour la gestion d'u00e9tat en mu00e9moire et AsyncStorage pour la persistance
 */
const useAuthStore = create<AuthState>((set, get) => ({
  // u00c9tat initial
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  userPhone: null,
  isLoading: true,
  error: null,
  
  /**
   * Connexion utilisateur
   * @param accessToken Token d'accu00e8s
   * @param refreshToken Token de rafrau00eechissement
   * @param phone Numu00e9ro de tu00e9lu00e9phone (optionnel)
   */
  login: async (accessToken: string, refreshToken: string, phone?: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Stocker les tokens dans AsyncStorage
      await AuthStorage.storeTokens(accessToken, refreshToken, phone);
      
      // Mettre u00e0 jour l'u00e9tat Zustand
      set({
        isAuthenticated: true,
        accessToken,
        refreshToken,
        userPhone: phone || null,
        isLoading: false
      });
      
      console.log('User logged in successfully');
    } catch (error) {
      console.error('Login error:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur de connexion'
      });
    }
  },
  
  /**
   * Du00e9connexion utilisateur
   */
  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Supprimer les tokens d'AsyncStorage
      await AuthStorage.clearAuthData();
      
      // Ru00e9initialiser l'u00e9tat Zustand
      set({
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
        userPhone: null,
        isLoading: false
      });
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur de du00e9connexion'
      });
    }
  },
  
  /**
   * Vu00e9rifie l'u00e9tat d'authentification au du00e9marrage de l'application
   * @returns true si l'utilisateur est authentifiu00e9, false sinon
   */
  checkAuthStatus: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Ru00e9cupu00e9rer les donnu00e9es d'authentification depuis AsyncStorage
      const authData = await AuthStorage.getAuthData();
      
      if (authData) {
        // Mettre u00e0 jour l'u00e9tat Zustand avec les donnu00e9es ru00e9cupu00e9ru00e9es
        set({
          isAuthenticated: true,
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          userPhone: authData.phone || null,
          isLoading: false
        });
        return true;
      } else {
        // Aucune donnu00e9e d'authentification trouvu00e9e
        set({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          userPhone: null,
          isLoading: false
        });
        return false;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      set({
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
        userPhone: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur de vu00e9rification d\'authentification'
      });
      return false;
    }
  },
  
  /**
   * Du00e9finit un message d'erreur
   * @param error Message d'erreur ou null pour effacer
   */
  setError: (error: string | null) => set({ error })
}));

export default useAuthStore;
