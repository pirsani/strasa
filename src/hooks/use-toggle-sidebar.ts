import { create, StateCreator } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";

// Define the state interface
interface ToggleSidebarState {
  collapsed: boolean;
  toggle: () => void;
  setCollapse: (collapsed: boolean) => void;
}

// Define the Zustand state creator function
const createState: StateCreator<ToggleSidebarState> = (set) => ({
  collapsed: false,
  toggle: () => set((state) => ({ collapsed: !state.collapsed })),
  setCollapse: (collapsed) => set({ collapsed }),
});

// Configure persistence options
const persistOptions: PersistOptions<ToggleSidebarState> = {
  name: "toggle-sidebar-storage", // Name for the local storage key
  //getStorage: () => localStorage, // Use localStorage for persistence
};

// Create the Zustand store with persistence
export const useToggleSidebar = create(persist(createState, persistOptions));

export default useToggleSidebar;
