import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Types de commande disponibles
 */
export enum OrderType {
  DELIVERY = 'DELIVERY',
  PICKUP = 'PICKUP',
  TABLE = 'TABLE'
}

/**
 * Types de table disponibles pour les réservations
 * Correspond aux types attendus par la base de données
 */
export enum DBTableType {
  TABLE_ROUND = 'TABLE_ROUND',
  TABLE_SQUARE = 'TABLE_SQUARE',
  TABLE_RECTANGLE = 'TABLE_RECTANGLE'
}

/**
 * Interface pour les données de réservation
 */
export interface ReservationData {
  date?: Date;
  time?: string;
  tableType?: string;
  numberOfPeople?: number;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  notes?: string;
}

/**
 * Interface pour le state du store de type de commande
 */
interface OrderTypeState {
  // État
  activeType: OrderType;
  reservationData: ReservationData;
  
  // Actions
  setActiveType: (type: OrderType) => void;
  setReservationData: (data: Partial<ReservationData>) => void;
  resetReservationData: () => void;
  resetAll: () => void;
  resetOrderTypeToDefault: () => void; // Fonction pour réinitialiser le type de commande à DELIVERY par défaut
  getFormattedReservationData: () => any; // Fonction pour obtenir les données formatées pour l'API
  isValidType: (type: any) => boolean; // Fonction pour vérifier si un type est valide
  setTypeIfValid: (type: any) => boolean; // Fonction pour définir le type s'il est valide
}

/**
 * Store centralisé pour gérer le type de commande actif et les données de réservation
 * Utilise le middleware persist pour sauvegarder automatiquement les données
 */
const useOrderTypeStore = create<OrderTypeState>()(
  persist(
    (set, get) => ({
      activeType: OrderType.DELIVERY, // Type par défaut
      reservationData: {},
      
      // Définir le type de commande actif
      setActiveType: (type) => {
        
        set({ activeType: type });
       
      },
      
      // Mettre à jour les données de réservation
      setReservationData: (data) => set((state) => ({
        reservationData: { ...state.reservationData, ...data }
      })),
      
      // Réinitialiser uniquement les données de réservation
      resetReservationData: () => {
        
        set({ reservationData: {} });
      },
      
      // Réinitialiser tout le store
      resetAll: () => set({ activeType: OrderType.DELIVERY, reservationData: {} }),
      
      // Réinitialiser le type de commande à DELIVERY par défaut
      resetOrderTypeToDefault: () => {
        
        set({ activeType: OrderType.DELIVERY });
      },
      
      // Vérifier si un type est valide
      isValidType: (type) => {
        return type === OrderType.DELIVERY || 
               type === OrderType.PICKUP || 
               type === OrderType.TABLE;
      },
      
      // Définir le type s'il est valide
      setTypeIfValid: (type) => {
        const isValid = type === OrderType.DELIVERY || 
                        type === OrderType.PICKUP || 
                        type === OrderType.TABLE;
        if (isValid) {
          get().setActiveType(type);
          return true;
        }
        return false;
      },
      
      // Obtenir les données de réservation formatées pour l'API
      getFormattedReservationData: () => {
        const { reservationData } = get();
        
        // Si les données sont incomplètes, retourner null
        if (!reservationData.date || !reservationData.time || !reservationData.tableType) {
          console.warn("Données de réservation incomplètes");
          return null;
        }
        
        // Formater la date au format JJ/MM/AAAA comme attendu par l'API
        const formattedDate = reservationData.date instanceof Date 
          ? reservationData.date.toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric'}).replace(/\//g, '/') 
          : new Date(reservationData.date).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric'}).replace(/\//g, '/');
        
        // Vérifier que le type de table est valide
        const isValidTableType = Object.values(DBTableType).includes(reservationData.tableType as DBTableType);
        
        if (!isValidTableType) {
          console.warn("Type de table invalide:", reservationData.tableType);
        }
        
        // Retourner les données formatées
        return {
          fullname: reservationData.fullName || '',
          email: reservationData.email || '',
          date: formattedDate,
          time: reservationData.time,
          tableType: reservationData.tableType,
          numberOfPeople: reservationData.numberOfPeople || 1,
          note: reservationData.notes || ''
        };
      }
    }),
    {
      name: 'order-type-storage', // Nom pour le stockage persistant
      storage: createJSONStorage(() => AsyncStorage), // Utiliser AsyncStorage
    }
  )
);

/**
 * Hook personnalisé pour faciliter l'utilisation du type de commande
 */
export const useOrderType = () => {
  const { activeType, setActiveType } = useOrderTypeStore();
  
  return {
    activeType,
    isDelivery: activeType === OrderType.DELIVERY,
    isPickup: activeType === OrderType.PICKUP,
    isTable: activeType === OrderType.TABLE,
    setDelivery: () => setActiveType(OrderType.DELIVERY),
    setPickup: () => setActiveType(OrderType.PICKUP),
    setTable: () => setActiveType(OrderType.TABLE),
  };
};

export default useOrderTypeStore;
