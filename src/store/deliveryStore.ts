import { create } from "zustand";

export enum DeliveryStep {
  INITIAL = "INITIAL",
  MENU_SELECTION = "MENU_SELECTION",
  LOCATION = "LOCATION",
  PAYMENT = "PAYMENT",
  CONFIRMATION = "CONFIRMATION"
}

interface DeliveryState {
  isActive: boolean;
  currentStep: DeliveryStep;
  progress: number;
  
  // Actions
  startDelivery: () => void;
  cancelDelivery: () => void;
  setStep: (step: DeliveryStep) => void;
  updateProgress: (progress: number) => void;
}

const useDeliveryStore = create<DeliveryState>((set) => ({
  isActive: false,
  currentStep: DeliveryStep.INITIAL,
  progress: 0,

  // Actions
  startDelivery: () => set({ 
    isActive: true, 
    currentStep: DeliveryStep.MENU_SELECTION,
    progress: 25 
  }),

  cancelDelivery: () => set({ 
    isActive: false, 
    currentStep: DeliveryStep.INITIAL,
    progress: 0 
  }),

  setStep: (step: DeliveryStep) => {
    const progressMap = {
      [DeliveryStep.INITIAL]: 0,
      [DeliveryStep.MENU_SELECTION]: 25,
      [DeliveryStep.LOCATION]: 50,
      [DeliveryStep.PAYMENT]: 75,
      [DeliveryStep.CONFIRMATION]: 100,
    };
    
    set({ 
      currentStep: step,
      progress: progressMap[step]
    });
  },

  updateProgress: (progress: number) => set({ progress }),
}));

export default useDeliveryStore; 