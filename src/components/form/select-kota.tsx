"use client";
import { getOptionsKota } from "@/actions/kota";
import { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";

interface SelectKotaProps {
  fieldName: string;
  onChange: (value: string | null) => void;
  value?: string | null;
  provinsiId?: string | null;
  isDisabled?: boolean;
}

interface Option {
  value: string;
  label: string;
}

export const SelectKota = ({
  fieldName,
  provinsiId,
  onChange,
  value,
  isDisabled = false,
}: SelectKotaProps) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedValue, setSelectedValue] = useState<string | null>(
    value ?? null
  );

  useEffect(() => {
    const fetchOptions = async () => {
      const optionKota = await getOptionsKota(provinsiId);
      if (optionKota) {
        const mappedOptions = optionKota.map((kota) => ({
          value: kota.idAndNama,
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
  }, [value, provinsiId]);

  const handleChange = (option: SingleValue<Option>) => {
    const newValue = option ? option.value : null;

    if (newValue) {
      const defaultOption = options.find((option) => option.value === newValue);
      setSelectedValue(newValue);
      onChange(newValue); // Call onChange handler
    } else {
      setSelectedValue(null);
    }
  };

  const setValue = (value: string | null) => {
    return options.find((option) => option.value === selectedValue) || null;
  };

  return (
    <Select
      isDisabled={isDisabled}
      instanceId={fieldName}
      options={options}
      isClearable
      onChange={handleChange}
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
