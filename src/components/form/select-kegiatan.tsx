"use client";
import { getOptionsKegiatan } from "@/actions/kegiatan";
import useTahunAnggaranStore from "@/hooks/use-tahun-anggaran-store";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";

interface SelectKegiatanProps {
  inputId: string;
  onChange?: (value: string | null) => void;
  value?: string;
  className?: string;
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
}: SelectKegiatanProps) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const { tahunAnggaran } = useTahunAnggaranStore();

  useEffect(() => {
    const fetchOptions = async () => {
      const optionKegiatan = await getOptionsKegiatan();
      if (optionKegiatan) {
        const mappedOptions = optionKegiatan.map((kegiatan) => ({
          value: kegiatan.value,
          label: kegiatan.label,
        }));
        setOptions(mappedOptions);
      }
    };
    fetchOptions();
  }, [tahunAnggaran]);

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
