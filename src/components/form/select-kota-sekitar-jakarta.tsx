"use client";
import { getOptionsKotaSekitarJakarta } from "@/actions/kota";
import { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";

interface SelectKotaProps {
  fieldName: string;
  onChange: (value: string | null) => void;
  value: string | null;
}

interface Option {
  value: string;
  label: string;
}

export const SelectKota = ({ fieldName, onChange, value }: SelectKotaProps) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedValue, setSelectedValue] = useState<string | null>(value);

  useEffect(() => {
    const fetchOptions = async () => {
      const optionKota = await getOptionsKotaSekitarJakarta();
      if (optionKota) {
        const mappedOptions = optionKota.map((kota) => ({
          value: kota.value,
          label: kota.label,
        }));
        setOptions(mappedOptions);

        console.log("mappedOptions", mappedOptions);

        // Set default value after options are loaded
        if (value) {
          console.log("value", value);
          const defaultOption = mappedOptions.find(
            (option) => option.value === value
          );
          console.log("defaultOption", defaultOption);
          setSelectedValue(defaultOption ? defaultOption.value : null);
        }
      }
    };

    fetchOptions();
  }, [value]);

  return (
    <Select
      instanceId={fieldName}
      options={options}
      isClearable
      onChange={(option: SingleValue<Option>) => {
        const newValue = option ? option.value : null;
        setSelectedValue(newValue); // Update local state
        onChange(newValue); // Call onChange handler
      }}
      value={options.find((option) => option.value === selectedValue) || null}
      getOptionLabel={(option) => option.label}
      getOptionValue={(option) => option.value.toString()}
      filterOption={(option, inputValue) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      }
    />
  );
};

export default SelectKota;
