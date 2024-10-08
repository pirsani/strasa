"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useTahunAnggaranStore from "@/hooks/use-tahun-anggaran-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const SelectTahunAnggaran = () => {
  const {
    tahunAnggaran,
    setTahunAnggaranYear,
    initializeTahunAnggaran,
    initialized,
  } = useTahunAnggaranStore();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) {
      initializeTahunAnggaran();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if tahunAnggaran is defined
  if (tahunAnggaran === undefined || tahunAnggaran === null) {
    return (
      <div className="bg-primary py-2 px-3 rounded-md text-white">tahun...</div>
    ); // Render a loading state or nothing
  }

  return (
    <Select
      value={`${tahunAnggaran}`}
      onValueChange={async (val) => {
        await setTahunAnggaranYear(parseInt(val));
        router.refresh();
      }}
    >
      <SelectTrigger className="bg-primary text-white font-semibold gap-1">
        <SelectValue placeholder="Tahun" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Tahun</SelectLabel>
          <SelectItem value="2024">2024</SelectItem>
          <SelectItem value="2025">2025</SelectItem>
          <SelectItem value="2026">2026</SelectItem>
          <SelectItem value="2027">2027</SelectItem>
          <SelectItem value="2028">2028</SelectItem>
          <SelectItem value="2029">2029</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SelectTahunAnggaran;
