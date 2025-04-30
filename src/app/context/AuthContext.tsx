import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthStorage } from "@/services/storage/auth-storage";
import { setAuthToken } from "@/services/api/api";
import { refreshToken } from "@/services/api/auth";

/**
 * Interface pour les données utilisateur
 */
export interface User {
  id: string;
  phone: string;
  first_name: string | null;
  last_name: string | null;
  birth_day: string | null;
  email: string | null;
  image: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Interface pour le contexte d'authentification
 */
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  login: (userData: User, accessToken: string, refreshTkn: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserData: (userData: Partial<User>, persistToStorage?: boolean) => void;
}

// Création du contexte
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Provider pour le contexte d'authentification
 * Gère l'état d'authentification et les tokens
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshTkn, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        const authData = await AuthStorage.getAuthData();
      
        if (authData?.accessToken) {
          try {
            // Vérifier si le token est valide
            const parts = authData.accessToken.split('.');
            if (parts.length !== 3) {
              console.error('[AUTH] Format de token invalide, déconnexion...');
              await logout();
              return;
            }
            
            // Essayer de décoder le token pour vérifier qu'il n'est pas corrompu
            try {
              JSON.parse(atob(parts[0])); // Header
              const payload = JSON.parse(atob(parts[1])); // Payload
              
              // Vérifier si le token est expiré
              const currentTime = Math.floor(Date.now() / 1000);
              if (payload.exp && payload.exp < currentTime) {
                console.log('[AUTH] Token expiré, tentative de rafraîchissement...');
                try {
                  // Tenter de rafraîchir le token
                  const refreshResult = await refreshToken(authData.refreshToken);
                  if (refreshResult && refreshResult.token) {
                    // Mettre à jour le token dans le stockage
                    await AuthStorage.storeTokens(refreshResult.token, authData.refreshToken);
                    setAuthToken(refreshResult.token);
                    setAccessToken(refreshResult.token);
                    console.log('[AUTH] Token rafraîchi avec succès');
                  } else {
                    throw new Error('Échec du rafraîchissement du token');
                  }
                } catch (refreshError) {
                  console.error('[AUTH] Échec du rafraîchissement du token:', refreshError);
                  await logout();
                  return;
                }
              }
            } catch (decodeError) {
              console.error('[AUTH] Token corrompu, déconnexion...', decodeError);
              await logout();
              return;
            }
            
            // Configurer le token pour les futures requêtes
            setAuthToken(authData.accessToken);
            setAccessToken(authData.accessToken);
            setRefreshToken(authData.refreshToken);
            
            // Récupérer les données utilisateur du stockage
            const userData = await AuthStorage.getUserData();
           
            if (userData) {
              // Log complet des données utilisateur pour le débogage
              console.log('=============================================');
              console.log('[AUTH] DONNÉES UTILISATEUR COMPLÈTES:');
              console.log(JSON.stringify(userData, null, 2));
              console.log(userData);
           
              
              setUser(userData);
            } else {
              setUser(null);
            }
          } catch (tokenError) {
            console.error('[AUTH] Erreur lors de la validation du token:', tokenError);
            await logout();
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  /**
   * Connexion utilisateur
   * @param userData Données utilisateur
   * @param token Token d'accès
   * @param refreshTkn Token de rafraîchissement
   */
  const login = async (userData: User, token: string, refreshTkn: string) => {
    try {
      // Stocker les tokens et les données utilisateur
      await AuthStorage.storeTokens(token, refreshTkn, userData.phone);
      await AuthStorage.storeUserData(userData);
      
      // Mettre à jour l'état local
      setUser(userData);
      setAccessToken(token);
      setRefreshToken(refreshTkn);
      
      // Configurer le token pour les futures requêtes
      setAuthToken(token);
      
      
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  };

  /**
   * Déconnexion utilisateur
   */
  const logout = async () => {
    try {
      // Effacer les tokens et les données utilisateur
      await AuthStorage.clearAuthData();
      
      // Réinitialiser l'état local
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      
      // Supprimer le token des futures requêtes
      setAuthToken(null);
      
      console.log('Utilisateur déconnecté avec succès');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  };

  /**
   * Mise à jour des données utilisateur
   * @param userData Données utilisateur partielles à mettre à jour
   * @param persistToStorage Si true, les données sont également stockées dans le localStorage
   */
  const updateUserData = (userData: Partial<User>, persistToStorage: boolean = false) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      // Ne stocker dans le localStorage que si explicitement demandé
      if (persistToStorage) {
        AuthStorage.storeUserData(updatedUser);
      
      } else {
        
      }
    }
  };

  // Valeur du contexte
  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    accessToken,
    refreshToken: refreshTkn,
    login,
    logout,
    updateUserData,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook pour utiliser le contexte d'authentification
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}

export default AuthProvider;