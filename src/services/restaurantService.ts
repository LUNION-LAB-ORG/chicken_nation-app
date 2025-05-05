/**
 * Service pour la gestion des restaurants
 */

import { api } from './api/api';
import { formatImageUrl } from '@/utils/imageHelpers';
import { Restaurant, Schedule } from '@/types';
import { CacheService } from './storage/storage';

// URL complète pour les restaurants
const RESTAURANTS_URL = '/v1/restaurants';

// Service de cache pour les restaurants
const restaurantCache = new CacheService(30); // Cache de 30 minutes

/**
 * Interface pour la réponse paginée de l'API
 */
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Interface pour les restaurants selon la réponse API
 */
interface RestaurantApiResponse {
  id: string;
  name: string;
  manager: string;
  description: string;
  image: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  schedule: string; // Format JSON string
  entity_status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Convertit un jour de la semaine en format français
 * @param dayNumber - Numéro du jour (1-7)
 * @returns Jour en français
 */
const getDayName = (dayNumber: number): string => {
  const days = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ];
  return days[dayNumber - 1] || "Inconnu";
};

/**
 * Vérifie si un restaurant est actuellement ouvert
 * @param scheduleJson - Horaires au format JSON string
 * @returns {boolean} true si le restaurant est ouvert
 */
const isRestaurantOpen = (scheduleJson: string): boolean => {
  try {
    const scheduleArray = JSON.parse(scheduleJson);
    const now = new Date();
    const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // Convertir dimanche (0) en 7
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Trouver l'horaire du jour actuel
    const todaySchedule = scheduleArray.find((item: any) => 
      Object.keys(item)[0] === currentDay.toString()
    );
    
    if (!todaySchedule) return false;
    
    const hours = todaySchedule[currentDay.toString()];
    if (hours === "Fermé") return false;
    
    const [openingTime, closingTime] = hours.split('-');
    const [openingHour, openingMinute] = openingTime.split(':').map(Number);
    const [closingHour, closingMinute] = closingTime.split(':').map(Number);
    
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const openingTimeInMinutes = openingHour * 60 + openingMinute;
    const closingTimeInMinutes = closingHour * 60 + closingMinute;
    
    return currentTimeInMinutes >= openingTimeInMinutes && currentTimeInMinutes <= closingTimeInMinutes;
  } catch (error) {
    console.error('Erreur lors de la vérification des horaires:', error);
    return false;
  }
};

/**
 * Convertit le format de l'horaire de l'API vers le format de l'application
 * @param scheduleJson - Horaires au format JSON string
 * @returns Schedule[] - Horaires formatés pour l'application
 */
const parseSchedule = (scheduleJson: string): Schedule[] => {
  try {
    const scheduleArray = JSON.parse(scheduleJson);
    return scheduleArray.map((item: any) => {
      const dayNumber = Number(Object.keys(item)[0]);
      const hours = item[dayNumber.toString()];
      
      if (hours === "Fermé") {
        return {
          day: getDayName(dayNumber),
          openingTime: "Fermé",
          closingTime: "Fermé"
        };
      }
      
      const [openingTime, closingTime] = hours.split('-');
      return {
        day: getDayName(dayNumber),
        openingTime,
        closingTime
      };
    });
  } catch (error) {
    console.error('Erreur lors du parsing des horaires:', error);
    return [];
  }
};

/**
 * Obtient l'heure d'ouverture ou de fermeture actuelle
 * @param scheduleJson - Horaires au format JSON string
 * @param isOpen - Si le restaurant est ouvert
 * @returns string - Heure d'ouverture ou de fermeture
 */
const getCurrentScheduleTime = (scheduleJson: string, isOpen: boolean): string => {
  try {
    const scheduleArray = JSON.parse(scheduleJson);
    const now = new Date();
    const currentDay = now.getDay() === 0 ? 7 : now.getDay();
    
    // Trouver l'horaire du jour actuel
    const todaySchedule = scheduleArray.find((item: any) => 
      Object.keys(item)[0] === currentDay.toString()
    );
    
    if (!todaySchedule) return "Indisponible";
    
    const hours = todaySchedule[currentDay.toString()];
    if (hours === "Fermé") {
      // Trouver le prochain jour d'ouverture
      let nextDay = currentDay;
      let nextDaySchedule;
      
      for (let i = 1; i <= 7; i++) {
        nextDay = nextDay % 7 + 1;
        nextDaySchedule = scheduleArray.find((item: any) => 
          Object.keys(item)[0] === nextDay.toString()
        );
        
        if (nextDaySchedule && nextDaySchedule[nextDay.toString()] !== "Fermé") {
          const [openingTime] = nextDaySchedule[nextDay.toString()].split('-');
          return openingTime;
        }
      }
      
      return "Indisponible";
    }
    
    const [openingTime, closingTime] = hours.split('-');
    return isOpen ? closingTime : openingTime;
  } catch (error) {
    console.error('Erreur lors de la récupération des horaires:', error);
    return "Indisponible";
  }
};

/**
 * Convertit un restaurant de l'API vers le format de l'application
 * @param apiRestaurant - Restaurant au format API
 * @returns Restaurant - Restaurant formaté pour l'application
 */
const mapApiRestaurantToAppRestaurant = (apiRestaurant: RestaurantApiResponse): Restaurant => {
  const isOpen = isRestaurantOpen(apiRestaurant.schedule);
  const schedule = parseSchedule(apiRestaurant.schedule);
  
  return {
    id: apiRestaurant.id,
    name: apiRestaurant.name,
    description: apiRestaurant.description,
    address: apiRestaurant.address,
    location: "Côte d'Ivoire", // Par défaut
    phone: apiRestaurant.phone,
    email: apiRestaurant.email,
    isOpen,
    closingTime: isOpen ? getCurrentScheduleTime(apiRestaurant.schedule, true) : undefined,
    openingTime: !isOpen ? getCurrentScheduleTime(apiRestaurant.schedule, false) : undefined,
    deliveryStartTime: schedule[0]?.openingTime || "10:00", // Utiliser la première heure d'ouverture par défaut
    deliveryEndTime: schedule[0]?.closingTime || "22:00", // Utiliser la première heure de fermeture par défaut
    image: apiRestaurant.image ? formatImageUrl(apiRestaurant.image) : undefined,
    latitude: apiRestaurant.latitude,
    longitude: apiRestaurant.longitude,
    schedule,
    tables: [
      { capacity: 2, quantity: 8, type: "indoor" },
      { capacity: 4, quantity: 6, type: "indoor" },
      { capacity: 6, quantity: 4, type: "indoor" }
    ],
    reservationTimeSlots: ["12:00", "13:00", "14:00", "19:00", "20:00", "21:00"],
    maxReservationSize: 12,
    minReservationSize: 1,
    reservationLeadHours: 2,
    reservationMaxDays: 14
  };
};

/**
 * Récupère tous les restaurants
 * @param page - Numéro de page
 * @param limit - Nombre d'éléments par page
 * @returns Promise<Restaurant[]> - Liste des restaurants
 */
export const getAllRestaurants = async (page: number = 1, limit: number = 10): Promise<Restaurant[]> => {
  try {
    const cacheKey = `restaurants-page-${page}-limit-${limit}`;
    
    // Vérifier si les données sont en cache
    const cachedData = await restaurantCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // Récupérer les données depuis l'API
    const response = await api.get<any>(
      `${RESTAURANTS_URL}?page=${page}&limit=${limit}`
    );
    
    if (!response || !response.data) {
      throw new Error('Format de réponse inattendu pour les restaurants');
    }
    
    // Extraire les données de la réponse
    const restaurantsData = response.data.data || [];
    
    if (!Array.isArray(restaurantsData)) {
      throw new Error('Format de réponse inattendu pour les restaurants (data n\'est pas un tableau)');
    }
    
    // Convertir les restaurants au format de l'application
    const restaurants = restaurantsData.map(mapApiRestaurantToAppRestaurant);
    
    // Mettre en cache les données
    await restaurantCache.set(cacheKey, restaurants, true);
    
    return restaurants;
  } catch (error) {
    console.error('Erreur lors de la récupération des restaurants:', error);
    throw error;
  }
};

/**
 * Récupère un restaurant par son ID
 * @param id - ID du restaurant
 * @returns Promise<Restaurant> - Restaurant
 */
export const getRestaurantById = async (id: string): Promise<Restaurant> => {
  try {
    const cacheKey = `restaurant-${id}`;
    
    // Vérifier si les données sont en cache
    const cachedData = await restaurantCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // Récupérer les données depuis l'API
    const response = await api.get<any>(
      `${RESTAURANTS_URL}/${id}`
    );
    
    if (!response || !response.data) {
      throw new Error(`Restaurant ${id} non trouvé`);
    }
    
    // Extraire les données de la réponse
    const restaurantData = response.data.data || response.data;
    
    if (!restaurantData || !restaurantData.id) {
      throw new Error(`Format de réponse inattendu pour le restaurant ${id}`);
    }
    
    // Convertir le restaurant au format de l'application
    const restaurant = mapApiRestaurantToAppRestaurant(restaurantData);
    
    // Mettre en cache les données
    await restaurantCache.set(cacheKey, restaurant, true);
    
    return restaurant;
  } catch (error) {
    console.error(`Erreur lors de la récupération du restaurant ${id}:`, error);
    throw error;
  }
};
