import { create } from "zustand";

interface TakeawayState {
  isActive: boolean;
  selectedDate: string | null;
  selectedHour: string;
  selectedMinute: string;
  setActive: (active: boolean) => void;
  setSelectedDate: (date: string | null) => void;
  setSelectedTime: (hour: string, minute: string) => void;
  reset: () => void;
}

const useTakeawayStore = create<TakeawayState>((set) => ({
  isActive: false,
  selectedDate: null,
  selectedHour: "11",
  selectedMinute: "30",
  setActive: (active) => set({ isActive: active }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTime: (hour, minute) => set({ selectedHour: hour, selectedMinute: minute }),
  reset: () => set({ isActive: false, selectedDate: null, selectedHour: "11", selectedMinute: "30" }),
}));

export default useTakeawayStore; 