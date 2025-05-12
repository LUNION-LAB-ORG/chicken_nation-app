import { create } from "zustand";
import { AuthStorage, AuthData } from "@/services/storage/auth-storage";

/**
 * Interface pour l'état d'authentification
 */
interface AuthState {
  // État
  isAuthenticated: boolean;
  accessToken: string | null;
  userPhone: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (accessToken: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
  setError: (error: string | null) => void;
}

/**
 * Store Zustand pour gérer l'état d'authentification
 * Combine Zustand pour la gestion d'état en mémoire et AsyncStorage pour la persistance
 */
const useAuthStore = create<AuthState>((set, get) => ({
  // État initial
  isAuthenticated: false,
  accessToken: null,
  userPhone: null,
  isLoading: true,
  error: null,
  
  /**
   * Connexion utilisateur
   * @param accessToken Token d'accès
   * @param phone Numéro de téléphone (optionnel)
   */
  login: async (accessToken: string, phone?: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Stocker les tokens dans AsyncStorage
      await AuthStorage.storeTokens(accessToken, phone);
      
      // Mettre à jour l'état Zustand
      set({
        isAuthenticated: true,
        accessToken,
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
   * Déconnexion utilisateur
   */
  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Supprimer les tokens d'AsyncStorage
      await AuthStorage.clearAuthData();
      
      // Réinitialiser l'état Zustand
      set({
        isAuthenticated: false,
        accessToken: null,
        userPhone: null,
        isLoading: false
      });
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur de déconnexion'
      });
    }
  },
  
  /**
   * Vérifie l'état d'authentification au démarrage de l'application
   * @returns true si l'utilisateur est authentifié, false sinon
   */
  checkAuthStatus: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Récupérer les données d'authentification depuis AsyncStorage
      const authData = await AuthStorage.getAuthData();
      
      if (authData) {
        // Mettre à jour l'état Zustand avec les données récupérées
        set({
          isAuthenticated: true,
          accessToken: authData.accessToken,
          userPhone: authData.phone || null,
          isLoading: false
        });
        return true;
      } else {
        // Aucune donnée d'authentification trouvée
        set({
          isAuthenticated: false,
          accessToken: null,
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
        userPhone: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur de vérification d\'authentification'
      });
      return false;
    }
  },
  
  /**
   * Définit un message d'erreur
   * @param error Message d'erreur ou null pour effacer
   */
  setError: (error: string | null) => set({ error })
}));

export default useAuthStore;
