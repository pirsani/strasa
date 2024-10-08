import { create } from "zustand";

interface isLoadingStore {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

export const useIsLoading = create<isLoadingStore>((set) => ({
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
}));
