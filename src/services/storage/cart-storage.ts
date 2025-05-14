import { storeData, getData, removeData, STORAGE_KEYS } from './storage';

/**
 * Interface pour un produit dans le panier
 */
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  options?: Record<string, any>;
}

/**
 * Interface pour le panier complet
 */
export interface Cart {
  items: CartItem[];
  total: number;
  restaurantId?: string;
  deliveryFee?: number;
  discount?: number;
}

/**
 * Service de stockage pour le panier
 * Fournit des mu00e9thodes spu00e9cifiques pour gu00e9rer les donnu00e9es du panier
 */
export const CartStorage = {
  /**
   * Ru00e9cupu00e8re le panier actuel
   * @returns Le panier ou un panier vide si non trouvu00e9
   */
  async getCart(): Promise<Cart> {
    try {
      const cart = await getData(STORAGE_KEYS.CART.ITEMS);
      return cart || { items: [], total: 0 };
    } catch (error) {
      console.error('Erreur lors de la récupération du panier:', error);
      return { items: [], total: 0 };
    }
  },

  /**
   * Enregistre le panier
   * @param cart Le panier u00e0 enregistrer
   */
  async saveCart(cart: Cart): Promise<void> {
    try {
      await storeData(STORAGE_KEYS.CART.ITEMS, cart);
      console.log('Panier enregistré avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du panier:', error);
      throw new Error('Erreur lors de l\'enregistrement du panier');
    }
  },

  /**
   * Ajoute un produit au panier
   * @param item Le produit u00e0 ajouter
   */
  async addItem(item: CartItem): Promise<Cart> {
    try {
      const cart = await this.getCart();
      
      // Vu00e9rifier si le produit existe du00e9ju00e0 dans le panier
      const existingItemIndex = cart.items.findIndex(i => i.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Mettre u00e0 jour la quantitu00e9 si le produit existe du00e9ju00e0
        cart.items[existingItemIndex].quantity += item.quantity;
      } else {
        // Ajouter le nouveau produit
        cart.items.push(item);
      }
      
      // Recalculer le total
      cart.total = this.calculateTotal(cart.items);
      
      // Sauvegarder le panier mis u00e0 jour
      await this.saveCart(cart);
      
      return cart;
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'un produit au panier:', error);
      throw new Error('Erreur lors de l\'ajout d\'un produit au panier');
    }
  },

  /**
   * Supprime un produit du panier
   * @param itemId ID du produit u00e0 supprimer
   */
  async removeItem(itemId: string): Promise<Cart> {
    try {
      const cart = await this.getCart();
      
      // Filtrer pour enlever le produit
      cart.items = cart.items.filter(item => item.id !== itemId);
      
      // Recalculer le total
      cart.total = this.calculateTotal(cart.items);
      
      // Sauvegarder le panier mis u00e0 jour
      await this.saveCart(cart);
      
      return cart;
    } catch (error) {
      console.error('Erreur lors de la suppression d\'un produit du panier:', error);
      throw new Error('Erreur lors de la suppression d\'un produit du panier');
    }
  },

  /**
   * Met u00e0 jour la quantitu00e9 d'un produit dans le panier
   * @param itemId ID du produit u00e0 mettre u00e0 jour
   * @param quantity Nouvelle quantitu00e9
   */
  async updateItemQuantity(itemId: string, quantity: number): Promise<Cart> {
    try {
      const cart = await this.getCart();
      
      // Trouver le produit u00e0 mettre u00e0 jour
      const itemIndex = cart.items.findIndex(item => item.id === itemId);
      
      if (itemIndex >= 0) {
        if (quantity <= 0) {
          // Supprimer le produit si la quantitu00e9 est 0 ou moins
          return this.removeItem(itemId);
        } else {
          // Mettre u00e0 jour la quantitu00e9
          cart.items[itemIndex].quantity = quantity;
          
          // Recalculer le total
          cart.total = this.calculateTotal(cart.items);
          
          // Sauvegarder le panier mis u00e0 jour
          await this.saveCart(cart);
        }
      }
      
      return cart;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
      throw new Error('Erreur lors de la mise à jour de la quantité');
    }
  },

  /**
   * Vide le panier
   */
  async clearCart(): Promise<void> {
    try {
      await removeData(STORAGE_KEYS.CART.ITEMS);
      console.log('Panier vidé avec succès');
    } catch (error) {
      console.error('Erreur lors de la vidange du panier:', error);
      throw new Error('Erreur lors de la vidange du panier');
    }
  },

  /**
   * Calcule le total du panier
   * @param items Produits dans le panier
   * @returns Total du panier
   */
  calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
};
