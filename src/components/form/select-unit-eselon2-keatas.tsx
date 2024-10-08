"use client";
import { getOptionsForEligibleSatkerAnggaran } from "@/actions/satker-anggaran";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";

interface SelectUnitEselon2KeatasProps {
  inputId: string;
  onChange?: (value: string | null) => void;
  value?: string;
  className?: string;
}

interface Option {
  value: string;
  label: string;
}

const SelectUnitEselon2Keatas = ({
  inputId,
  onChange = () => {},
  value,
  className,
}: SelectUnitEselon2KeatasProps) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      const options = await getOptionsForEligibleSatkerAnggaran();
      if (options) {
        const mappedOptions = options.map((option) => ({
          value: option.value,
          label: option.label,
        }));
        setOptions(mappedOptions);
      }
    };
    fetchOptions();
  }, []);

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

export default SelectUnitEselon2Keatas;
