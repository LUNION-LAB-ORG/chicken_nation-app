import { create } from 'zustand';

interface PaymentState {
  isProcessing: boolean;
  paymentSuccess: boolean;
  paymentError: string | null;
  isWebViewOpen: boolean;
  paymentData: any | null;
  setProcessing: (isProcessing: boolean) => void;
  setPaymentSuccess: (success: boolean) => void;
  setPaymentError: (error: string | null) => void;
  setWebViewOpen: (isOpen: boolean) => void;
  setPaymentData: (data: any) => void;
  resetPaymentState: () => void;
}

const usePaymentStore = create<PaymentState>((set) => ({
  isProcessing: false,
  paymentSuccess: false,
  paymentError: null,
  isWebViewOpen: false,
  paymentData: null,
  setProcessing: (isProcessing) => set({ isProcessing }),
  setPaymentSuccess: (success) => set({ paymentSuccess: success }),
  setPaymentError: (error) => set({ paymentError: error }),
  setWebViewOpen: (isOpen) => set({ isWebViewOpen: isOpen }),
  setPaymentData: (data) => set({ paymentData: data }),
  resetPaymentState: () => set({ 
    isProcessing: false, 
    paymentSuccess: false, 
    paymentError: null,
    isWebViewOpen: false,
    paymentData: null
  }),
}));

export default usePaymentStore; 