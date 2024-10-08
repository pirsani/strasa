"use client";
import { getOptionsPejabatEselon2keAtas } from "@/actions/sbm";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";

interface SelectPejabatEselon2keAtasProps {
  inputId: string;
  onChange?: (value: number | null) => void;
  value?: number;
  className?: string;
}

interface Option {
  value: number;
  label: string;
}

const SelectPejabatEselon2keAtas = ({
  inputId,
  onChange = () => {},
  value,
  className,
}: SelectPejabatEselon2keAtasProps) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      const optionPejabat = await getOptionsPejabatEselon2keAtas();
      if (optionPejabat) {
        const mappedOptions = optionPejabat.map((pejabat) => ({
          value: pejabat.value,
          label: pejabat.label,
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
      // menuPortalTarget={document.body} // Use state which is set after component mounts
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      }}
      className={cn("w-full", className)}
    />
  );
};

export default SelectPejabatEselon2keAtas;
