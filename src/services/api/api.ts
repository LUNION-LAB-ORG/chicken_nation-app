// src/services/api.ts
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { AuthStorage } from "@/services/storage/auth-storage";

export const API_BASE_URL = "https://chicken.turbodeliveryapp.com/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json'
  },
});

// Intercepteurs désactivés pour éviter les logs
api.interceptors.request.use(
  (config) => {
    // S'assurer que les headers sont uniformes
    if (config.headers) {
      config.headers['Accept'] = 'application/json, text/plain, */*';
      config.headers['Content-Type'] = 'application/json';
      
      // S'assurer que le token est bien dans les headers
      const token = api.defaults.headers.common['Authorization'];
      if (token) {
        config.headers['Authorization'] = token;
      }
    }
    
   
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si l'erreur est 401 et que ce n'est pas une tentative de reconnexion
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('[API] Erreur 401 détectée');
      
      // Marquer la requête comme retentée
      originalRequest._retry = true;
      
      try {
        // Vérifier si nous avons un token
        const authData = await AuthStorage.getAuthData();
        if (!authData?.accessToken) {
          console.log('[API] Pas de token trouvé, déconnexion...');
          await AuthStorage.clearAuthData();
          return Promise.reject(error);
        }
        
        // Vérifier si le token est expiré
        const parts = authData.accessToken.split('.');
        if (parts.length === 3) {
          try {
            const payload = JSON.parse(atob(parts[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            
            if (payload.exp && payload.exp < currentTime) {
             
              await AuthStorage.clearAuthData();
              return Promise.reject(error);
            }
          } catch (e) {
          
          }
        }
        
  
        return Promise.reject(error);
      } catch (e) {
        console.error('[API] Erreur lors de la gestion de l\'erreur 401:', e);
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper pour les requêtes sécurisées
export const setAuthToken = (token: string | null) => {
  if (token) {
    const authHeader = `Bearer ${token}`;
    api.defaults.headers.common['Authorization'] = authHeader;
   
  } else {
    delete api.defaults.headers.common['Authorization'];
   
  }
};