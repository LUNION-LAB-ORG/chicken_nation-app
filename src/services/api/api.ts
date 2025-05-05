// src/services/api.ts
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { AuthStorage } from "@/services/storage/auth-storage";
import { refreshToken as refreshTokenApi } from "./auth";

const API_BASE_URL = "https://chicken.turbodeliveryapp.com/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    
  },
});

// Flag pour éviter les appels multiples de rafraîchissement de token
let isRefreshing = false;
// File d'attente des requêtes en attente pendant le rafraîchissement
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void; config: AxiosRequestConfig }[] = [];

// Fonction pour traiter la file d'attente
const processQueue = (error: any | null, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      // Mettre à jour le token dans la requête en attente
      promise.config.headers = promise.config.headers || {};
      promise.config.headers.Authorization = `Bearer ${token}`;
      promise.resolve(api(promise.config));
    }
  });
  
  // Vider la file d'attente
  failedQueue = [];
};

// Intercepteurs désactivés pour éviter les logs
api.interceptors.request.use(
  (config) => {
    // Aucun log
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Aucun log
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Si l'erreur est 401 (Unauthorized) et que la requête n'a pas déjà été retentée
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Marquer la requête comme déjà retentée pour éviter les boucles infinies
      originalRequest._retry = true;
      
      // Si un rafraîchissement est déjà en cours, mettre la requête en file d'attente
      if (isRefreshing) {
        try {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject, config: originalRequest });
          });
        } catch (err) {
          return Promise.reject(err);
        }
      }
      
      isRefreshing = true;
      
      try {
        // Récupérer le refresh token
        const refreshTkn = await AuthStorage.getRefreshToken();
        
        if (!refreshTkn) {
          // Si pas de refresh token, rejeter toutes les requêtes en attente
          processQueue(new Error('No refresh token available'));
          return Promise.reject(error);
        }
        
        // Appeler l'API pour obtenir un nouveau token d'accès
        const response = await refreshTokenApi(refreshTkn);
        const newAccessToken = response.token;
        
        // Stocker le nouveau token d'accès
        await AuthStorage.storeTokens(newAccessToken, refreshTkn);
        
        // Mettre à jour le token dans les headers par défaut
        setAuthToken(newAccessToken);
        
        // Mettre à jour le token dans la requête originale
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        // Traiter les requêtes en file d'attente
        processQueue(null, newAccessToken);
        
        // Retenter la requête originale avec le nouveau token
        return api(originalRequest);
      } catch (refreshError) {
        // En cas d'échec du rafraîchissement, rejeter toutes les requêtes
        processQueue(refreshError);
        
        // Si le rafraîchissement échoue, c'est probablement que le refresh token est invalide
        // Dans ce cas, on ne déconnecte pas automatiquement l'utilisateur pour éviter les déconnexions intempestives
        console.error('Échec du rafraîchissement du token:', refreshError);
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper pour les requêtes sécurisées si besoin plus tard
export const setAuthToken = (token: string | null) => {
  if (token) {
    // Simplement définir le token sans vérification complexe
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log('Token d\'authentification configuré');
  } else {
    delete api.defaults.headers.common["Authorization"];
    console.log('Token d\'authentification supprimé');
  }
};