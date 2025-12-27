// /store/history.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { IdentifyPlantFromImageOutput } from '@/ai/flows/identify-plant-from-image';

export type HistoryItem = IdentifyPlantFromImageOutput & {
  id: string;
  imageUrl: string;
  timestamp: string;
};

interface HistoryState {
  history: HistoryItem[];
  addHistoryItem: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  removeHistoryItem: (id: string) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      history: [],
      addHistoryItem: (item) =>
        set((state) => ({
          history: [
            {
              ...item,
              id: new Date().toISOString(),
              timestamp: new Date().toLocaleString(),
            },
            ...state.history,
          ],
        })),
      removeHistoryItem: (id) =>
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'plant-history', // Unique key for local storage
      storage: createJSONStorage(() => localStorage),
    }
  )
);

