import { api } from "./api";
import { AuthStorage } from "../storage/auth-storage"; 

export interface CreatePaymentDto {
  amount: number;
  order_id?: string;
  mode: "MOBILE_MONEY" | "CREDIT_CARD" | "VIREMENT" | "CASH";
  mobile_money_type?: "ORANGE" | "MTN" | "MOOV" | "WAVE";
  status: "PENDING" | "SUCCESS" | "FAILED";
  reference: string;
}

export interface PaymentResponse {
  id: string;
  amount: number;
  order_id?: string;
  mode: string;
  mobile_money_type?: string;
  status: string;
  reference: string;
  created_at: string;
  updated_at: string;
}

/**
 * Crée un nouveau paiement
 * @param data Données du paiement
 * @returns Réponse du paiement
 */
export const createPayment = async (data: CreatePaymentDto): Promise<PaymentResponse> => {
  try {
    // Récupérer le token d'authentification
    const authData = await AuthStorage.getAuthData();
    if (!authData?.accessToken) {
      throw new Error('Authentification requise pour créer un paiement');
    }

    // Envoyer la requête POST
    const response = await api.post('v1/paiements', data, {
      headers: {
        'Authorization': `Bearer ${authData.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('[CREATE PAYMENT] Erreur:', error.response?.data || error.message);
    throw new Error(error?.response?.data?.message || 'Erreur lors de la création du paiement');
  }
};

/**
 * Met à jour un paiement existant
 * @param paymentId ID du paiement à mettre à jour
 * @param data Données de mise à jour
 * @returns Réponse du paiement mis à jour
 */
export const updatePayment = async (paymentId: string, data: Partial<CreatePaymentDto>): Promise<PaymentResponse> => {
  try {
    // Récupérer le token d'authentification
    const authData = await AuthStorage.getAuthData();
    if (!authData?.accessToken) {
      throw new Error('Authentification requise pour mettre à jour un paiement');
    }

    // Envoyer la requête PUT
    const response = await api.put(`v1/paiements/${paymentId}`, data, {
      headers: {
        'Authorization': `Bearer ${authData.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('[UPDATE PAYMENT] Erreur:', error.response?.data || error.message);
    throw new Error(error?.response?.data?.message || 'Erreur lors de la mise à jour du paiement');
  }
}; 