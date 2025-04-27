// src/services/api/address.ts
import { api } from "./api";

/**
 * Interface pour les données d'adresse
 */
export interface Address {
  id?: number;
  title: string;
  address: string;
  street: string;
  city: string;
  longitude: number;
  latitude: number;
}

/**
 * Récupère toutes les adresses de l'utilisateur
 * @returns Liste des adresses de l'utilisateur
 */
export const getUserAddresses = async (): Promise<Address[]> => {
  try {
    const response = await api.get("/v1/addresses");
    
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

/**
 * Ajoute une nouvelle adresse pour l'utilisateur
 * @param addressData Données de l'adresse à ajouter
 * @returns Adresse ajoutée
 */
export const addUserAddress = async (addressData: Address): Promise<Address | null> => {
  try {
    const response = await api.post("/v1/addresses", addressData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'adresse:", error);
    return null;
  }
};

/**
 * Met à jour une adresse existante
 * @param addressId ID de l'adresse à mettre à jour
 * @param addressData Nouvelles données de l'adresse
 * @returns Adresse mise à jour
 */
export const updateUserAddress = async (
  addressId: number,
  addressData: Partial<Address>
): Promise<Address | null> => {
  try {
    const response = await api.put(`/v1/addresses/${addressId}`, addressData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'adresse:", error);
    return null;
  }
};

/**
 * Supprime une adresse
 * @param addressId ID de l'adresse à supprimer
 * @returns true si la suppression a réussi, false sinon
 */
export const deleteUserAddress = async (addressId: number): Promise<boolean> => {
  try {
    await api.delete(`/v1/addresses/${addressId}`);
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression de l'adresse:", error);
    return false;
  }
};
