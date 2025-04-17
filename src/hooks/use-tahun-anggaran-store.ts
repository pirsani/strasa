import setTahunAnggaran, {
  getTahunAnggaranPilihan,
} from "@/actions/pengguna/preference";
import { create, StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

// Define the state interface
type TahunAnggaranState = {
  tahunAnggaran: number | null;
  initialized: boolean;
};

type TahunAnggaranStoreActions = {
  setTahunAnggaranYear: (year: number) => Promise<void>;
  initializeTahunAnggaran: () => Promise<number>;
};

type TahunAnggaranStore = TahunAnggaranState & TahunAnggaranStoreActions;

// Define the Zustand state creator function
const createState: StateCreator<TahunAnggaranStore> = () => ({
  tahunAnggaran: null,
  initialized: false,
  setTahunAnggaranYear: async (year) => {
    await setTahunAnggaran(year);
  },
  initializeTahunAnggaran: async () => {
    const tahunAnggaran = await getTahunAnggaranPilihan();
    useTahunAnggaranStore.setState({
      tahunAnggaran,
      initialized: true,
    });
    console.log("Tahun anggaran initialized:", "tahunAnggaran", tahunAnggaran);
    return tahunAnggaran;
  },
});

const tahunAnggaranStore = createStore<TahunAnggaranStore>()(
  persist(createState, { name: "tahun-anggaran-storage" })
);

const useTahunAnggaranStore = create(createState);

export default useTahunAnggaranStore;
