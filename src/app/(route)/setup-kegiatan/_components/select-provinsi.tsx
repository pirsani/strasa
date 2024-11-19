"use client";
import { getOptionsProvinsiExcludeJakarta } from "@/actions/sbm";
import { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";

interface SelectProvinsiProps {
  fullKey: string;
  onChange: (value: string | null) => void;
  value?: string | null;
  isDisabled?: boolean;
}

interface Option {
  value: string;
  label: string;
}

const SelectProvinsi = ({
  fullKey,
  onChange,
  value,
  isDisabled = false,
}: SelectProvinsiProps) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedValue, setSelectedValue] = useState<string | null | undefined>(
    value
  );

  useEffect(() => {
    const fetchOptions = async () => {
      const optionProvinsi = await getOptionsProvinsiExcludeJakarta();
      if (optionProvinsi) {
        const mappedOptions = optionProvinsi.map((provinsi) => ({
          value: provinsi.value,
          label: provinsi.label,
        }));
        setOptions(mappedOptions);

        // console.log("mappedOptions", mappedOptions);
        // console.log("provinsi default value:", value);

        // Set default value after options are loaded
        if (value) {
          const defaultOption = mappedOptions.find(
            (option) => option.value === value
          );
          //console.log("defaultOption", defaultOption);
          setSelectedValue(defaultOption ? defaultOption.value : null);
        }
      }
    };

    fetchOptions();
  }, [value]);

  // Update selectedValue when value prop changes
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  return (
    <Select
      isDisabled={isDisabled}
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

export default SelectProvinsi;
