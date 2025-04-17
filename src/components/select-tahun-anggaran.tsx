"use client";
import { getTahunAnggaranPilihan } from "@/actions/pengguna/preference";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

const SelectTahunAnggaran = () => {
  const [ta, setTa] = useState<number | null>(null);

  useEffect(() => {
    console.log("Initializing tahunAnggaran...");
    const tainit = async () => {
      const taq = await getTahunAnggaranPilihan();
      console.log("Tahun anggaran initialized:", "tahunAnggaran", taq);
      setTa(taq);
    };
    tainit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if tahunAnggaran is defined
  if (ta === null) {
    //signOut();
    return (
      <div className="bg-primary py-2 px-3 rounded-md text-white">tahun...</div>
    ); // Render a loading state or nothing
  }

  return (
    <Select
      value={`${ta}`}
      onValueChange={(val) => {
        const newTa = parseInt(val, 10); // Convert the value to a number
        setTa(newTa); // Update the state
        console.log("Tahun anggaran updated:", newTa);
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
