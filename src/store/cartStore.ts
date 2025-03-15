import { ReactNode } from "react";
import { create } from "zustand";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: any;
  description?: string;
  extras?: string[];
}

interface CartStore {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  decrementItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const useCartStore = create<CartStore>((set) => ({
  items: [],
  totalItems: 0,
  totalAmount: 0,

  addToCart: (item) =>
    set((state) => {
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
    }),

  decrementItem: (itemId) =>
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
    }),

  removeFromCart: (itemId) =>
    set((state) => {
      const itemToRemove = state.items.find((i) => i.id === itemId);
      if (!itemToRemove) return state;

      return {
        items: state.items.filter((i) => i.id !== itemId),
        totalItems: state.totalItems - itemToRemove.quantity,
        totalAmount:
          state.totalAmount - itemToRemove.price * itemToRemove.quantity,
      };
    }),

  updateQuantity: (itemId, quantity) =>
    set((state) => {
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
    }),

  clearCart: () =>
    set({
      items: [],
      totalItems: 0,
      totalAmount: 0,
    }),
}));

export default useCartStore;
