"use client";
import {
  getOptionsKegiatan,
  getOptionsKegiatanOnAlurProses,
} from "@/actions/kegiatan";
import useTahunAnggaranStore from "@/hooks/use-tahun-anggaran-store";
import { ALUR_PROSES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";

interface SelectKegiatanProps {
  inputId: string;
  onChange?: (value: string | null) => void;
  value?: string;
  className?: string;
  proses?: ALUR_PROSES | null;
}

interface Option {
  value: string;
  label: string;
}

const SelectKegiatan = ({
  inputId,
  onChange = () => {},
  value,
  className,
  proses,
}: SelectKegiatanProps) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const { tahunAnggaran } = useTahunAnggaranStore();

  useEffect(() => {
    const fetchOptions = async () => {
      if (proses) {
        const optionsKegiatan = await getOptionsKegiatanOnAlurProses(proses);
        return setOptions(optionsKegiatan);
      } else {
        const optionsKegiatan = await getOptionsKegiatan();
        return setOptions(optionsKegiatan);
        // if (optionKegiatan) {
        //   const mappedOptions = optionKegiatan.map((kegiatan) => ({
        //     value: kegiatan.value,
        //     label: kegiatan.label,
        //   }));
        //   setOptions(mappedOptions);
        // }
      }
    };
    fetchOptions();
  }, [tahunAnggaran, proses]);

  useEffect(() => {
    if (value !== undefined) {
      const selected = options.find((option) => option.value === value) || null;
      setSelectedOption(selected);
    }
  }, [value, options]);

  const handleChange = (selected: SingleValue<Option>) => {
    setSelectedOption(selected);
    onChange(selected ? selected.value : null);
  };

  return (
    <Select
      placeholder="Pilih Kegiatan"
      inputId={inputId}
      instanceId={inputId}
      value={selectedOption}
      onChange={handleChange}
      options={options}
      isClearable
      //menuPortalTarget={document.body} // Use state which is set after component mounts
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        // control: (base) => ({ ...base, zIndex: 1000 }), // Ensure control has high z-index
      }}
      className={cn("w-full", className)}
    />
  );
};

export default SelectKegiatan;
