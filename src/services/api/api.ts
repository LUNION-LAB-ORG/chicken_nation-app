// src/services/api.ts
import axios from "axios";

const API_BASE_URL = "https://chicken.turbodeliveryapp.com/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    // "Content-Type": "application/json", // SUPPRIMÉ pour permettre l'upload FormData
  },
});

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
  (error) => {
    return Promise.reject(error);
  }
);

// Helper pour les requêtes sécurisées si besoin plus tard
export const setAuthToken = (token: string | null) => {
  if (token) {
    try {
      // Vérification basique de la validité du token JWT
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Format de token invalide:', token);
        return;
      }
      
      // Vérifier que chaque partie peut être décodée
      try {
        JSON.parse(atob(parts[0])); // Header
        JSON.parse(atob(parts[1])); // Payload
      } catch (e) {
        console.error('Token JWT corrompu:', e);
        return;
      }
      
      // Si tout est valide, définir le token
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      console.log('Token d\'authentification configuré avec succès');
    } catch (error) {
      console.error('Erreur lors de la configuration du token:', error);
      // Ne pas définir le token s'il est corrompu
    }
  } else {
    delete api.defaults.headers.common["Authorization"];
    console.log('Token d\'authentification supprimé');
  }
};