// src/services/api/address.ts
import { api } from "./api";
import { setAuthToken } from "./api";
import { AuthStorage } from "@/services/storage/auth-storage";

/**
 * Interface pour les données d'adresse
 */
export interface Address {
  id?: string | number; // Permettre les deux types d'ID
  title: string;
  address: string;
  street: string;
  city: string;
  longitude: number;
  latitude: number;
  customer_id?: string | number; // ID utilisateur pour la nouvelle API
}

// Fonction helper pour récupérer l'utilisateur du stockage
const getUserFromStorage = async () => {
  try {
    // Utiliser la fonction exportée du contexte d'authentification
    const { getCurrentUser } = require('@/app/context/AuthContext');
    const user = await getCurrentUser();
    return user;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return null;
  }
};

export const getUserAddresses = async (): Promise<Address[]> => {
  try {
    // Récupérer l'ID de l'utilisateur connecté
    const user = await getUserFromStorage();
    
    if (!user || !user.id) {
      console.error("Utilisateur non connecté ou ID manquant");
      return [];
    }
    
    // Utiliser le bon endpoint avec l'ID de l'utilisateur
    console.log(`Récupération des adresses pour l'utilisateur ${user.id}`);
    const response = await api.get(`/v1/addresses/customer/${user.id}`);
    
    // Vérifier si la réponse est un tableau
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && typeof response.data === 'object') {
      // Si la réponse est un objet avec une propriété data ou items
      if (Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data.items)) {
        return response.data.items;
      }
    }
    
    // Si on ne peut pas extraire un tableau, retourner un tableau vide
    return [];
  } catch (error) {
    console.error("Erreur lors de la récupération des adresses:", error);
    return [];
  }
};

export const addUserAddress = async (addressData: Address): Promise<Address | null> => {
  try {
    // S'assurer que l'adresse n'est pas vide (champ obligatoire)
    if (!addressData.address || addressData.address.trim() === '') {
      console.error("L'adresse ne peut pas être vide");
      
      // Essayer de construire une adresse valide à partir des autres champs disponibles
      if (addressData.street && addressData.street.trim() !== '') {
        addressData.address = addressData.street;
      } else if (addressData.city && addressData.city.trim() !== '') {
        addressData.address = `Adresse à ${addressData.city}`;
      } else {
        // Si aucune information n'est disponible, utiliser une valeur par défaut
        addressData.address = "Adresse sélectionnée";
      }
      
      console.log("Adresse automatiquement corrigée:", addressData.address);
    }
    
    // Ajouter l'ID de l'utilisateur aux données si nécessaire
    const user = await getUserFromStorage();
    if (user && user.id && !addressData.customer_id) {
      addressData.customer_id = user.id;
    }
    
    // Log des données envoyées
    console.log(`Ajout d'une adresse pour l'utilisateur ${addressData.customer_id}`);
    console.log(`Données d'adresse envoyées:`, JSON.stringify(addressData, null, 2));
    
    const response = await api.post("/v1/addresses", addressData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'adresse:", error);
    // Afficher plus de détails sur l'erreur
    if (error.response) {
      console.error("Détails de l'erreur:", JSON.stringify(error.response.data, null, 2));
      console.error("Status:", error.response.status);
    }
    return null;
  }
};

export const updateUserAddress = async (
  addressId: string | number, // Accepter les deux types d'ID
  addressData: Partial<Address>
): Promise<Address | null> => {
  try {
    // Configurer le token d'authentification avant la requête
    const token = await AuthStorage.getAccessToken();
    setAuthToken(token);
    console.log("Token d'authentification configuré");
    
    // S'assurer que l'adresse n'est pas vide si elle est fournie
    if (addressData.address !== undefined && (!addressData.address || addressData.address.trim() === '')) {
      console.error("L'adresse ne peut pas être vide lors d'une mise à jour");
      
      // Essayer de construire une adresse valide à partir des autres champs disponibles
      if (addressData.street && addressData.street.trim() !== '') {
        addressData.address = addressData.street;
      } else if (addressData.city && addressData.city.trim() !== '') {
        addressData.address = `Adresse à ${addressData.city}`;
      } else {
        // Si aucune information n'est disponible, utiliser une valeur par défaut
        addressData.address = "Adresse modifiée";
      }
      
      console.log("Adresse automatiquement corrigée lors de la mise à jour:", addressData.address);
    }
    
    // Récupérer l'utilisateur pour l'ID
    const user = await getUserFromStorage();
    if (!user || !user.id) {
      console.error("Utilisateur non connecté ou ID manquant");
      return null;
    }
    
    // Préparer un objet simplifié pour la mise à jour
    // Ne garder que les champs essentiels pour éviter les conflits
    const simplifiedData = {
      title: addressData.title,
      address: addressData.address,
      latitude: addressData.latitude,
      longitude: addressData.longitude,
      // Ne pas inclure customer_id dans la mise à jour
    };
    
    // Log des données envoyées
    console.log(`Mise à jour de l'adresse ${addressId} (type: ${typeof addressId}) pour l'utilisateur ${user.id}`);
    console.log(`Données d'adresse envoyées pour la mise à jour:`, JSON.stringify(simplifiedData, null, 2));
    
    // Utiliser PATCH avec les données simplifiées
    // D'après les mémoires, l'endpoint correct est /v1/addresses/{addressId}
    console.log(`Endpoint utilisé: /v1/addresses/${addressId}`);
    const response = await api.patch(`/v1/addresses/${addressId}`, simplifiedData);
    console.log("Réponse du serveur:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'adresse:", error);
    // Afficher plus de détails sur l'erreur
    if (error.response) {
      console.error("Détails de l'erreur:", JSON.stringify(error.response.data, null, 2));
      console.error("Status:", error.response.status);
      
      // Si erreur 500, essayer une approche alternative
      if (error.response.status === 500) {
        console.log("Tentative avec un format alternatif...");
        try {
          // Essayer sans le champ address qui pourrait causer des problèmes
          const alternativeData = {
            title: addressData.title,
            latitude: addressData.latitude,
            longitude: addressData.longitude
          };
          
          console.log("Données alternatives:", JSON.stringify(alternativeData, null, 2));
          const alternativeResponse = await api.patch(`/v1/addresses/${addressId}`, alternativeData);
          console.log("Réponse alternative du serveur:", JSON.stringify(alternativeResponse.data, null, 2));
          return alternativeResponse.data;
        } catch (altError) {
          console.error("Échec de la tentative alternative:", altError);
        }
      }
    }
    return null;
  }
};

export const deleteUserAddress = async (addressId: string | number): Promise<boolean> => {
  try {
    // Configurer le token d'authentification avant la requête
    const token = await AuthStorage.getAccessToken();
    setAuthToken(token);
    console.log("Token d'authentification configuré pour la suppression");
    
    // Vérifier que l'ID d'adresse est valide
    if (!addressId) {
      console.error("ID d'adresse invalide pour la suppression");
      return false;
    }
    
    console.log(`Suppression de l'adresse ${addressId} (type: ${typeof addressId})`);
    await api.delete(`/v1/addresses/${addressId}`);
    console.log(`Adresse ${addressId} supprimée avec succès`);
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression de l'adresse:", error);
    // Afficher plus de détails sur l'erreur
    if (error.response) {
      console.error("Détails de l'erreur:", JSON.stringify(error.response.data, null, 2));
      console.error("Status:", error.response.status);
    }
    return false;
  }
};
