"use client";
import { getOptionsProvinsi } from "@/actions/sbm";
import { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";

interface SelectSbmProvinsiProps {
  fullKey: string;
  onChange: (value: string | null) => void;
  value: string | null;
}

interface Option {
  value: string;
  label: string;
}

const SelectSbmProvinsi = ({
  fullKey,
  onChange,
  value,
}: SelectSbmProvinsiProps) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedValue, setSelectedValue] = useState<string | null>(value);

  useEffect(() => {
    const fetchOptions = async () => {
      const optionProvinsi = await getOptionsProvinsi();
      if (optionProvinsi) {
        const mappedOptions = optionProvinsi.map((provinsi) => ({
          value: provinsi.value,
          label: provinsi.label,
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
      instanceId={fullKey}
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
      menuPortalTarget={document.body} // Ensure the menu is rendered in the document body
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }} // Ensure high z-index
    />
  );
};

export default SelectSbmProvinsi;
