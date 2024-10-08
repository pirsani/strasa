"use client";
import { getOptionsSatkerAnggaran } from "@/actions/organisasi";
import { randomStrimg } from "@/utils/random-string";
import { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";

interface SelectSatkerAnggaranProps {
  fieldName: string;
  onChange: (value: string | null) => void;
  value: string | null;
}

interface Option {
  value: string;
  label: string;
}

const SelectSatkerAnggaran = ({
  fieldName,
  onChange,
  value,
}: SelectSatkerAnggaranProps) => {
  const [options, setOptions] = useState<Option[]>([]);
  const genId = randomStrimg(5);

  useEffect(() => {
    const fetchOptions = async () => {
      const optionSatkerAnggaran = await getOptionsSatkerAnggaran();
      if (optionSatkerAnggaran) {
        const mappedOptions = optionSatkerAnggaran.map((satker) => ({
          value: satker.value,
          label: satker.label,
        }));
        setOptions(mappedOptions);
      }
    };

    fetchOptions();
  }, []);

  return (
    <Select
      instanceId={fieldName}
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
      // menuPortalTarget={document.body} // Ensure the menu is rendered in the document body so it doesn't get clipped by overflow:hidden containers
      // styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }} // Ensure the menu has a high z-index
      aria-labelledby={`${fieldName}-${genId}`}
    />
  );
};

export default SelectSatkerAnggaran;
