// src/services/api/customer.ts
import { api } from "./api";
import { AuthStorage } from "@/services/storage/auth-storage";
import { formatImageUrl } from "@/utils/imageHelpers";

/**
 * Interface pour la création d'un client
 */
export interface CreateCustomerDto {
  phone: string;          // Obligatoire
  first_name?: string;    // Prénom
  last_name?: string;     // Nom
  birth_day?: string;     // Format: "YYYY-MM-DD"
  email?: string;         // Email (optionnel)
  image?: string;         // URL de l'image (optionnel)
}

/**
 * Interface pour la mise à jour d'un client
 */
export interface UpdateCustomerDto {
  phone?: string;
  first_name?: string;
  last_name?: string;
  birth_day?: string;
  email?: string;
  image?: string;
}

/**
 * Interface pour la réponse de l'API concernant un client
 */
export interface CustomerResponse {
  id: string;
  phone: string;
  first_name: string;
  last_name: string;
  birth_day: string;
  email: string;
  image: string;
  created_at: string;
  updated_at: string;
}

/**
 * Crée un nouveau client
 * @param data Données du client à créer
 * @param token Token d'authentification (optionnel)
 * @returns Données du client créé
 */
export const createCustomer = async (data: CreateCustomerDto, token?: string): Promise<CustomerResponse> => {
  try {
    const config = token ? {
      headers: {
        Authorization: `Bearer ${token}`
      }
    } : undefined;
    // Créer une copie des données SANS le champ phone
    const { phone, ...dataWithoutPhone } = data;
    const formattedData = { ...dataWithoutPhone };
    console.log('Creating new customer with token:', token ? 'Token provided' : 'No token');
    console.log('Request data (no phone):', formattedData);
    const response = await api.post("/v1/customer", formattedData, config);
    return response.data;
  } catch (error: any) {
    console.error('Create customer error:', error.response?.data || error.message);
    throw new Error(error?.response?.data?.message || "Erreur lors de la création du compte");
  }
};

/**
 * Met à jour les informations d'un client avec logs détaillés et timeout allongé
 */
export const updateCustomer = async (data: UpdateCustomerDto, token?: string): Promise<CustomerResponse> => {
  try {
    // --- SUPPRIMER le champ 'phone' du payload ---
    let cleanData: any = data;
    if (data instanceof FormData) {
      // Créer un nouveau FormData sans 'phone'
      const newFormData = new FormData();
      // @ts-ignore
      for (let [key, value] of data._parts || []) {
        if (key !== 'phone') newFormData.append(key, value);
      }
      cleanData = newFormData;
    } else if (typeof data === 'object' && data !== null) {
      const { phone, ...rest } = data;
      cleanData = rest;
    }

    let config = {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json, text/plain, */*',
      } as any,
      timeout: 20000, // 20 secondes (augmente le timeout)
    };

    if (!(cleanData instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    } else if (config.headers['Content-Type']) {
      delete config.headers['Content-Type'];
    }

    console.log('--- [updateCustomer] ---');
    console.log('Token:', token ? 'Fourni' : 'Non fourni');
    console.log('Headers:', config.headers);
    console.log('Payload:', cleanData instanceof FormData ? '[FormData]' : cleanData);
    console.log('Appel PATCH', '/v1/customer');

    const response = await api.patch("/v1/customer", cleanData, config);
    console.log('Réponse API:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Update customer error:', error.response?.data || error.message);
    throw new Error(error?.response?.data?.message || "Erreur lors de la mise à jour du profil");
  }
};

/**
 * Récupère les détails du client connecté
 * @returns Données du client
 */
export const getCustomerDetails = async (): Promise<CustomerResponse> => {
  try {
    // Essayer d'abord avec l'endpoint principal
    try {
      const response = await api.get("/v1/customer");
      const userData = response.data;
      
      // Formater l'URL de l'image si elle existe
      if (userData && userData.image) {
        userData.image = formatImageUrl(userData.image);
      }
      
      return userData;
    } catch (primaryError) {
      console.log('Erreur avec l\'endpoint principal, tentative avec l\'endpoint alternatif');
      
      // Si l'endpoint principal échoue, essayer l'endpoint alternatif
      try {
        const response = await api.get("/v1/customer/detail");
        const userData = response.data;
        
        // Formater l'URL de l'image si elle existe
        if (userData && userData.image) {
          userData.image = formatImageUrl(userData.image);
        }
        
        return userData;
      } catch (secondaryError) {
        console.log('Erreur avec l\'endpoint alternatif, récupération depuis le stockage local');
        
        // Si les deux endpoints échouent, récupérer les données du stockage local
        return await getCustomerFromStorage();
      }
    }
  } catch (error: any) {
    console.error('Erreur lors de la récupération du profil:', error);
    // En dernier recours, récupérer les données du stockage local
    return await getCustomerFromStorage();
  }
};

/**
 * Récupère les données du client depuis le stockage local
 * @returns Données du client stockées localement
 */
export const getCustomerFromStorage = async (): Promise<CustomerResponse> => {
  try {
    const userData = await AuthStorage.getUserData();
    
    if (!userData) {
      throw new Error('Aucune donnée utilisateur trouvée dans le stockage local');
    }
    
    // Formater l'URL de l'image si elle existe
    if (userData.image) {
      userData.image = formatImageUrl(userData.image);
    }
    
    return userData as CustomerResponse;
  } catch (error: any) {
    console.error('Erreur lors de la récupération des données du stockage:', error);
    throw new Error('Impossible de récupérer les données utilisateur');
  }
};
