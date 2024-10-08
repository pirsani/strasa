"use client";
import { getOptionsMateri } from "@/actions/honorarium";
import { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";

interface SelectMateriProps {
  inputId: string;
  onChange: (value: string | null) => void;
  value: string | null;
}

interface Option {
  value: string;
  label: string;
}

const SelectMateri = ({ inputId, onChange, value }: SelectMateriProps) => {
  const [options, setOptions] = useState<Option[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      const optionMateri = await getOptionsMateri();
      if (optionMateri) {
        const mappedOptions = optionMateri.map((kelas) => ({
          value: kelas.value,
          label: kelas.label,
        }));
        setOptions(mappedOptions);
      }
    };

    fetchOptions();
  }, []);

  return (
    <Select
      instanceId={inputId}
      inputId={inputId} // Pass the inputId prop here ""
      options={options}
      isClearable
      onChange={(option: SingleValue<Option>) =>
        onChange(option ? option.value : null)
      }
      value={options.find((option) => option.value === value) || null}
      getOptionLabel={(option) => option.label}
      getOptionValue={(option) => option.value.toString()}
      filterOption={(option, inputValue) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      }
      //menuPortalTarget={document.body} // Ensure the menu is rendered in the document body so it doesn't get clipped by overflow:hidden containers
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }} // Ensure the menu has a high z-index
    />
  );
};

export default SelectMateri;
