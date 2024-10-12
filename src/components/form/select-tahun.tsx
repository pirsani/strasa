"use client";
import { randomStrimg } from "@/utils/random-string";
import { useState } from "react";
import Select, { SingleValue } from "react-select";

const TAHUN_OPTIONS = [
  { value: null, label: "-" },
  { value: 2024, label: "2024" },
  { value: 2025, label: "2025" },
  { value: 2026, label: "2026" },
  { value: 2027, label: "2027" },
  { value: 2028, label: "2028" },
  { value: 2029, label: "2029" },
  { value: 2030, label: "2030" },
  { value: 2031, label: "2031" },
  { value: 2032, label: "2032" },
  { value: 2033, label: "2033" },
  { value: 2034, label: "2034" },
];
interface Option {
  value: number | null;
  label: string;
}
interface SelectTahunProps {
  fieldName: string;
  value?: number | null;
  onChange: (value: number | null) => void;
}
export const SelectTahun = ({
  fieldName,
  value,
  onChange = () => {},
}: SelectTahunProps) => {
  const [selectedValue, setSelectedValue] = useState<number | null>(
    value ?? null
  );
  const genId = randomStrimg(5);
  return (
    <Select
      instanceId={`${fieldName}-${genId}`}
      id={`${fieldName}-${genId}`}
      options={TAHUN_OPTIONS}
      onChange={(option: SingleValue<Option>) => {
        const newValue = option ? option.value : null;
        setSelectedValue(newValue); // Update local state
        onChange(newValue); // Call onChange handler
      }}
      value={TAHUN_OPTIONS.find((option) => option.value === value)}
      classNamePrefix="react-select"
      // Ensure react-select manages its internal state correctly
      aria-labelledby={`${fieldName}-${genId}`}
      tabSelectsValue={true} // Prevent tab from selecting the value
      menuIsOpen={undefined} // Allow the menu to open/close naturally
      isSearchable={true} // Ensure the select is searchable
    />
  );
};

export default SelectTahun;
