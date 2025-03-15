/**
 * Configuration des endpoints de l'API
 */

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  USERS: {
    BASE: "/users",
    PROFILE: (id: string) => `/users/${id}/profile`,
    ORDERS: (id: string) => `/users/${id}/orders`,
    FAVORITES: (id: string) => `/users/${id}/favorites`,
    NOTIFICATIONS: (id: string) => `/users/${id}/notifications`,
  },
  RESTAURANTS: {
    BASE: "/restaurants",
    MENU: (id: string) => `/restaurants/${id}/menu`,
    REVIEWS: (id: string) => `/restaurants/${id}/reviews`,
    RESERVATIONS: (id: string) => `/restaurants/${id}/reservations`,
  },
  PRODUCTS: {
    BASE: "/products",
    CATEGORIES: "/products/categories",
    REVIEWS: (id: string) => `/products/${id}/reviews`,
  },
  ORDERS: {
    BASE: "/orders",
    STATUS: (id: string) => `/orders/${id}/status`,
  },
};
