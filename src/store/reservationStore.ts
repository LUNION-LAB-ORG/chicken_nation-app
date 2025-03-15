import { create } from "zustand";

/**
 * Enum pour les étapes de réservation
 */
export enum ReservationStep {
  NONE = "none", // Pas de réservation en cours
  SELECT_DATE = "date", // Sélection de la date et l'heure
  DETAILS = "details", // Détails de la réservation
  MENU_SELECTION = "menu", // Sélection du menu
  CONFIRMATION = "confirmation", // Confirmation finale
}

/**
 * Interface pour les données de réservation
 */
export interface ReservationData {
  email: any;
  phoneNumber: any;
  notes: any;
  fullName: any;
  restaurantId?: string;
  date?: Date;
  time?: string;
  numberOfPeople?: number;
  tableType?: string;
  specialRequests?: string;
}

/**
 * Interface pour l'état du store
 */
interface ReservationState {
  isActive: boolean;
  currentStep: ReservationStep;
  progress: number;
  data: ReservationData;

  // Actions
  startReservation: () => void;
  setStep: (step: ReservationStep) => void;
  updateData: (partialData: Partial<ReservationData>) => void;
  completeReservation: () => void;
  cancelReservation: () => void;
}

/**
 * Store pour gérer l'état de la réservation dans toute l'application
 */
const useReservationStore = create<ReservationState>((set) => ({
  isActive: false,
  currentStep: ReservationStep.NONE,
  progress: 0,
  data: {
    phoneNumber: undefined,
    notes: undefined,
    fullName: undefined,
    email: undefined,
  },

  // Démarre un nouveau processus de réservation
  startReservation: () =>
    set({
      isActive: true,
      currentStep: ReservationStep.SELECT_DATE,
      progress: 25, 
      data: {
        phoneNumber: undefined,
        notes: undefined,
        fullName: undefined,
        email: undefined,
      },
    }),

  // Met à jour l'étape actuelle et la progression
  setStep: (step: ReservationStep) =>
    set((state) => {
      let progress;
      switch (step) {
        case ReservationStep.SELECT_DATE:
          progress = 25; 
          break;
        case ReservationStep.DETAILS:
          progress = 50;  
          break;
        case ReservationStep.MENU_SELECTION:
          progress = 70;  
          break;
        case ReservationStep.CONFIRMATION:
          progress = 100; // Finalisation
          break;
        default:
          progress = 0;
      }
      return { currentStep: step, progress };
    }),

  // Met à jour les données de réservation
  updateData: (partialData) =>
    set((state) => ({
      data: { ...state.data, ...partialData },
    })),

  // Finalise la réservation
  completeReservation: () =>
    set({
      progress: 100,
      currentStep: ReservationStep.NONE,
      isActive: false,
    }),

  // Annule la réservation en cours
  cancelReservation: () =>
    set({
      isActive: false,
      currentStep: ReservationStep.NONE,
      progress: 0,
      data: {
        phoneNumber: undefined,
        notes: undefined,
        fullName: undefined,
        email: undefined,
      },
    }),
}));

export default useReservationStore;
