import { ReactNode } from "react";
import { create } from "zustand";
import { CartStorage } from "@/services/storage/cart-storage";

// Définir une interface CartItem compatible avec celle de cart-storage
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: any; // Rendre l'image optionnelle pour éviter les erreurs de type
  description?: string;
  extras?: string[];
  options?: any; // Ajouter la propriété options pour les suppléments
}

interface CartStore {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  isLoading: boolean;
  initialized: boolean;
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  decrementItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  initializeCart: () => Promise<void>;
}

const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  totalItems: 0,
  totalAmount: 0,
  isLoading: false,
  initialized: false,

  // Initialise le panier depuis le stockage persistant
  initializeCart: async () => {
    try {
      set({ isLoading: true });
      const storedCart = await CartStorage.getCart();
      
      if (storedCart && storedCart.items) {
        // Convertir les items du stockage au format attendu par le store
        const convertedItems: CartItem[] = storedCart.items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || null,
          description: item.options?.description,
          extras: item.options?.extras as string[] || []
        }));
        
        const totalItems = convertedItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = convertedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        set({
          items: convertedItems,
          totalItems,
          totalAmount,
          isLoading: false,
          initialized: true
        });
      } else {
        set({ isLoading: false, initialized: true });
      }
    } catch (error) {
      console.error('Error initializing cart:', error);
      set({ isLoading: false, initialized: true });
    }
  },

  addToCart: async (item) => {
    set({ isLoading: true });
    
    const newState = set((state) => {
      const existingItem = state.items.find((i) => i.id === item.id);

      if (existingItem) {
        const updatedItems = state.items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i,
        );
        return {
          items: updatedItems,
          totalItems: state.totalItems + item.quantity,
          totalAmount: state.totalAmount + item.price * item.quantity,
        };
      }

      return {
        items: [...state.items, item],
        totalItems: state.totalItems + item.quantity,
        totalAmount: state.totalAmount + item.price * item.quantity,
      };
    });
    
    // Sauvegarder dans le stockage persistant
    try {
      // Convertir les items du store au format attendu par le stockage
      const storageItems = get().items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        options: {
          description: item.description,
          extras: item.extras
        }
      }));
      
      await CartStorage.saveCart({
        items: storageItems,
        total: get().totalAmount
      });
    } catch (error) {
      console.error('Error saving cart:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  decrementItem: async (itemId) => {
    set({ isLoading: true });
    
    set((state) => {
      const existingItem = state.items.find((i) => i.id === itemId);
      if (!existingItem) return state;

      if (existingItem.quantity === 1) {
        return {
          items: state.items.filter((i) => i.id !== itemId),
          totalItems: state.totalItems - 1,
          totalAmount: state.totalAmount - existingItem.price,
        };
      }

      const updatedItems = state.items.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item,
      );

      return {
        items: updatedItems,
        totalItems: state.totalItems - 1,
        totalAmount: state.totalAmount - existingItem.price,
      };
    });
    
    // Sauvegarder dans le stockage persistant
    try {
      // Convertir les items du store au format attendu par le stockage
      const storageItems = get().items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        options: {
          description: item.description,
          extras: item.extras
        }
      }));
      
      await CartStorage.saveCart({
        items: storageItems,
        total: get().totalAmount
      });
    } catch (error) {
      console.error('Error saving cart:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  removeFromCart: async (itemId) => {
    set({ isLoading: true });
    
    set((state) => {
      const itemToRemove = state.items.find((i) => i.id === itemId);
      if (!itemToRemove) return state;

      return {
        items: state.items.filter((i) => i.id !== itemId),
        totalItems: state.totalItems - itemToRemove.quantity,
        totalAmount:
          state.totalAmount - itemToRemove.price * itemToRemove.quantity,
      };
    });
    
    // Sauvegarder dans le stockage persistant
    try {
      // Convertir les items du store au format attendu par le stockage
      const storageItems = get().items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        options: {
          description: item.description,
          extras: item.extras
        }
      }));
      
      await CartStorage.saveCart({
        items: storageItems,
        total: get().totalAmount
      });
    } catch (error) {
      console.error('Error saving cart:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateQuantity: async (itemId, quantity) => {
    set({ isLoading: true });
    
    set((state) => {
      // Si la quantité est 0, on supprime l'article au lieu de mettre à jour sa quantité
      if (quantity === 0) {
        const updatedItems = state.items.filter(item => item.id !== itemId);
        
        const newTotalItems = updatedItems.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        const newTotalAmount = updatedItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );

        return {
          items: updatedItems,
          totalItems: newTotalItems,
          totalAmount: newTotalAmount,
        };
      }
      
      // Sinon, on met à jour la quantité normalement
      const updatedItems = state.items.map((item) => {
        if (item.id === itemId) {
          return { ...item, quantity };
        }
        return item;
      });

      const newTotalItems = updatedItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      const newTotalAmount = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      return {
        items: updatedItems,
        totalItems: newTotalItems,
        totalAmount: newTotalAmount,
      };
    });
    
    // Sauvegarder dans le stockage persistant
    try {
      // Convertir les items du store au format attendu par le stockage
      const storageItems = get().items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        options: {
          description: item.description,
          extras: item.extras
        }
      }));
      
      await CartStorage.saveCart({
        items: storageItems,
        total: get().totalAmount
      });
    } catch (error) {
      console.error('Error saving cart:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  clearCart: async () => {
    set({ isLoading: true });
    
    set({
      items: [],
      totalItems: 0,
      totalAmount: 0,
    });
    
    // Vider le stockage persistant
    try {
      await CartStorage.clearCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useCartStore;
