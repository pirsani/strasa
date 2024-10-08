import { create } from "zustand";

// Define the interface for the file store state
interface FileStore {
  fileUrl: string | null; // URL of the currently selected file
  isPreviewHidden: boolean; // Flag indicating if the file preview is hidden
  setFileUrl: (url: string | null) => void; // Function to update the file URL
  showPreview: () => void; // Function to explicitly set preview visibility to true
  hidePreview: () => void; // Function to explicitly set preview visibility to false
}

// Create the Zustand store with the FileStore interface
const useFileStore = create<FileStore>((set) => ({
  fileUrl: null, // Initialize file URL as null
  isPreviewHidden: false, // Initialize preview visibility flag as false

  // Function to update the file URL
  setFileUrl: (url) => set({ fileUrl: url }),

  // Function to explicitly set preview visibility to true
  showPreview: () => set({ isPreviewHidden: false }),

  // Function to explicitly set preview visibility to false
  hidePreview: () => set({ isPreviewHidden: true }),
}));

export default useFileStore;
