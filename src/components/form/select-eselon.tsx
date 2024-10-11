"use client";
import { randomStrimg } from "@/utils/random-string";
import { useState } from "react";
import Select, { SingleValue } from "react-select";

const ESELON_OPTIONS = [
  { value: null, label: "-" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
];
interface Option {
  value: number | null;
  label: string;
}
interface SelectEselonProps {
  fieldName: string;
  value?: number | null;
  onChange: (value: number | null) => void;
}
export const SelectEselon = ({
  fieldName,
  value,
  onChange = () => {},
}: SelectEselonProps) => {
  const [selectedValue, setSelectedValue] = useState<number | null>(
    value ?? null
  );
  const genId = randomStrimg(5);
  return (
    <Select
      instanceId={`${fieldName}-${genId}`}
      id={`${fieldName}-${genId}`}
      options={ESELON_OPTIONS}
      onChange={(option: SingleValue<Option>) => {
        const newValue = option ? option.value : null;
        setSelectedValue(newValue); // Update local state
        onChange(newValue); // Call onChange handler
      }}
      value={ESELON_OPTIONS.find((option) => option.value === value)}
      classNamePrefix="react-select"
      // Ensure react-select manages its internal state correctly
      aria-labelledby={`${fieldName}-${genId}`}
      tabSelectsValue={true} // Prevent tab from selecting the value
      menuIsOpen={undefined} // Allow the menu to open/close naturally
      isSearchable={true} // Ensure the select is searchable
    />
  );
};

export default SelectEselon;
