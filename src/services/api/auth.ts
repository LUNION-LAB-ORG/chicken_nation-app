// src/services/auth.ts
import { api } from "./api";

interface RegisterDto {
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface LoginDto {
  phone: string;
  password: string;
}

interface OtpVerifyDto {
  phone: string;
  otp: string;
}

interface CustomerLoginResponse {
  exists: boolean;
  message: string;
  otp?: string;  
}

export interface AuthResponse {
  token: string;
  id: string;
  phone: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  birth_day: string | null;
  image: string | null;
  created_at: string;
  updated_at: string;
}

// Fonction pour s'inscrire
export const register = async (data: RegisterDto): Promise<AuthResponse> => {
  try {
    const response = await api.post("/v1/auth/register", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Erreur lors de l'inscription");
  }
};

// Fonction pour se connecter
export const login = async (data: LoginDto): Promise<AuthResponse> => {
  try {
    const response = await api.post("/v1/auth/login", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Erreur lors de la connexion");
  }
};

// Fonction pour la connexion client par téléphone (demande OTP)
export const loginCustomer = async (phone: string): Promise<CustomerLoginResponse> => {
  try {
    // Formater le numéro de téléphone au format requis "+2250102030201"
    const formattedPhone = formatPhoneNumber(phone);
    
    // Pour l'API, on envoie sans le +
    const apiPhone = formattedPhone.startsWith('+') ? formattedPhone.substring(1) : formattedPhone;
    
    const response = await api.post("/v1/auth/customer/login", { phone: apiPhone });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Erreur lors de la demande de connexion");
  }
};

// Fonction pour vérifier le code OTP
export const verifyOTP = async (data: OtpVerifyDto): Promise<AuthResponse> => {
  try {
    // Formater le numéro de téléphone au format requis "+2250102030201"
    const formattedPhone = formatPhoneNumber(data.phone);
    
    // Pour l'API, on envoie sans le +
    const apiPhone = formattedPhone.startsWith('+') ? formattedPhone.substring(1) : formattedPhone;
    
    // Préparer le payload avec exactement le format attendu
    const payload = {
      phone: apiPhone,
      otp: data.otp
    };
    
    const response = await api.post("/v1/auth/customer/verify-otp", payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Code OTP invalide");
  }
};

// Fonction pour demander un nouveau code OTP
export const requestOTP = async (phone: string): Promise<void> => {
  try {
    // Nettoyer le numéro de téléphone (enlever le + si présent)
    const cleanedPhone = phone.startsWith('+') ? phone.substring(1) : phone;
    
    await api.post("/v1/auth/customer/login", { phone: cleanedPhone });
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Erreur lors de l'envoi du code OTP");
  }
};

// Fonction pour rafraîchir le token
export const refreshToken = async (refresh_token: string): Promise<{ token: string }> => {
  try {
    const response = await api.get("/v1/auth/refresh-token", { 
      params: { type: "customer" },
      headers: { Authorization: `Bearer ${refresh_token}` }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Erreur lors du rafraîchissement du token");
  }
};

 
export const formatPhoneNumber = (phone: string): string => {
  // Supprimer tous les caractères non numériques
  let cleaned = phone.replace(/\D/g, '');
  
  // Supprimer le préfixe 225 s'il existe déjà
  if (cleaned.startsWith('225')) {
    cleaned = cleaned.substring(3);
  }
  
  // Ajouter le préfixe +225
  return `+225${cleaned}`;
};