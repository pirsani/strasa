"use client";

import { getOptionsNarasumber } from "@/actions/honorarium";
import { useEffect, useState } from "react";
import Select, {
  ActionMeta,
  InputActionMeta,
  MultiValue,
  SingleValue,
} from "react-select";

interface SelectNarasumberProps {
  inputId: string;
  onChange: (values: string[] | string | null) => void;
  values: string[] | string | null;
  isMulti: boolean;
  tabIndex?: number;
}

interface Option {
  value: string;
  label: string;
}

const SelectNarasumber = ({
  inputId,
  onChange,
  values,
  isMulti,
  tabIndex = 0,
}: SelectNarasumberProps) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [inputValue, setInputValue] = useState(""); // State for managing input value
  const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);

  useEffect(() => {
    // Fetch options from the backend
    const fetchOptions = async () => {
      try {
        const optionNarasumber = await getOptionsNarasumber();
        if (optionNarasumber) {
          const mappedOptions = optionNarasumber.map((narasumber) => ({
            value: narasumber.value,
            label: narasumber.label,
          }));
          setOptions(mappedOptions);
        }
      } catch (error) {
        console.error("Failed to fetch options:", error);
      }
    };

    fetchOptions();
  }, []);

  // Function to handle changes when selecting options
  const handleChange = (
    option: SingleValue<Option> | MultiValue<Option>,
    actionMeta: ActionMeta<Option>
  ) => {
    const newValue = isMulti
      ? (option as MultiValue<Option>).map((opt) => opt.value)
      : (option as SingleValue<Option>)?.value || null;

    onChange(newValue); // Pass the updated values to the parent component

    // Reset input value on select for single select mode
    // if (!isMulti) {
    //   setInputValue("");
    // }
    setInputValue("");
  };

  // Function to handle input value changes
  const handleInputChange = (value: string, actionMeta: InputActionMeta) => {
    if (actionMeta.action === "input-change") {
      setInputValue(value);
      setMenuIsOpen(true);
    }
  };

  // Function to determine which values should be selected
  const selectedValue = isMulti
    ? options.filter((option) =>
        Array.isArray(values) ? values.includes(option.value) : false
      )
    : options.find((option) => option.value === values) || null;

  return (
    <Select
      instanceId={inputId}
      inputId={inputId}
      isMulti={isMulti}
      isClearable
      closeMenuOnSelect={!isMulti}
      options={options}
      onChange={handleChange}
      onInputChange={handleInputChange}
      inputValue={inputValue}
      value={selectedValue}
      filterOption={(option, inputValue) => {
        if (inputValue.trim() === "" && !menuIsOpen) {
          return false; // Do not show any options if input is empty
        }
        return option.label.toLowerCase().includes(inputValue.toLowerCase());
      }}
      onBlur={() => setInputValue("")} // Reset input when the dropdown loses focus
      onMenuOpen={() => setMenuIsOpen(true)} // Open menu when chevron is clicked
      onMenuClose={() => setMenuIsOpen(false)} // Close menu when it loses focus
      tabSelectsValue={inputValue.trim() !== ""} // Prevent tab from selecting the highlighted option when input is empty
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }} // Ensures the dropdown menu is visible even with complex layouts
      tabIndex={tabIndex}
    />
  );
};

export default SelectNarasumber;
