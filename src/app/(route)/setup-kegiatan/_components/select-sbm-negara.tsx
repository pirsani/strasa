"use client";
import { getOptionsNegara } from "@/actions/sbm";
import { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";

interface SelectSbmNegaraProps {
  fullKey: string;
  onChange: (value: string | null) => void;
  value: string | null;
}

interface Option {
  value: string;
  label: string;
}

const SelectSbmNegara = ({
  fullKey,
  onChange,
  value,
}: SelectSbmNegaraProps) => {
  const [options, setOptions] = useState<Option[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      const optionNegara = await getOptionsNegara();
      if (optionNegara) {
        const mappedOptions = optionNegara.map((negara) => ({
          value: negara.value,
          label: negara.label,
        }));
        setOptions(mappedOptions);
      }
    };

    fetchOptions();
  }, []);

  return (
    <Select
      instanceId={fullKey}
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
      menuPortalTarget={document.body} // Ensure the menu is rendered in the document body so it doesn't get clipped by overflow:hidden containers
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }} // Ensure the menu has a high z-index
    />
  );
};

export default SelectSbmNegara;
