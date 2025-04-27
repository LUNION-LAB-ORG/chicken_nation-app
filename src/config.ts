/**
 * Configuration globale de l'application
 */

// URL de base de l'API
export const API_URL = "https://chicken.turbodeliveryapp.com";

// Timeout par défaut pour les requêtes API (en ms)
export const API_TIMEOUT = 15000;

// Version de l'API
export const API_VERSION = "v1";

// Paramètres de cache
export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 heures
};
