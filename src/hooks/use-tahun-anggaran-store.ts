import setTahunAnggaran, {
  getTahunAnggranPilihan,
} from "@/actions/pengguna/preference";
import { create, StateCreator } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";

// Define the state interface
interface TahunAnggaranState {
  tahunAnggaran: number | null;
  initialized: boolean;
  setTahunAnggaranYear: (year: number) => Promise<void>;
  initializeTahunAnggaran: () => void;
}

// Define the Zustand state creator function
const createState: StateCreator<TahunAnggaranState> = (set) => ({
  tahunAnggaran: null,
  initialized: false,
  setTahunAnggaranYear: async (year) => {
    set({ tahunAnggaran: year });
    await setTahunAnggaran(year);
  },
  initializeTahunAnggaran: async () => {
    const tahunAnggaran = await getTahunAnggranPilihan();
    set({ tahunAnggaran, initialized: true });
  },
});

// Configure persistence options
const persistOptions: PersistOptions<TahunAnggaranState> = {
  name: "tahun-anggaran-storage", // Name for the local storage key
};

// Create the Zustand store with persistence
export const useTahunAnggaranStore = create(
  persist(createState, persistOptions)
);

export default useTahunAnggaranStore;
