"use client";
import { randomStrimg } from "@/utils/random-string";
import { useState } from "react";
import Select, { SingleValue } from "react-select";

const GOLONGAN_RUANG_OPTIONS = [
  { value: null, label: "-" },
  { value: "II/A", label: "II/A" },
  { value: "II/B", label: "II/B" },
  { value: "II/C", label: "II/C" },
  { value: "II/D", label: "II/D" },
  { value: "III/A", label: "III/A" },
  { value: "III/B", label: "III/B" },
  { value: "III/C", label: "III/C" },
  { value: "III/D", label: "III/D" },
  { value: "IV/A", label: "IV/A" },
  { value: "IV/B", label: "IV/B" },
  { value: "IV/C", label: "IV/C" },
  { value: "IV/D", label: "IV/D" },
  { value: "IV/E", label: "IV/E" },
];
interface Option {
  value: string | null;
  label: string;
}
interface SelectGolonganRuangProps {
  fieldName: string;
  value?: string | null;
  onChange: (value: string | null) => void;
}
export const SelectGolonganRuang = ({
  fieldName,
  value,
  onChange = () => {},
}: SelectGolonganRuangProps) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(
    value ?? null
  );
  const genId = randomStrimg(5);
  return (
    <Select
      instanceId={`${fieldName}-${genId}`}
      id={`${fieldName}-${genId}`}
      options={GOLONGAN_RUANG_OPTIONS}
      onChange={(option: SingleValue<Option>) => {
        const newValue = option ? option.value : null;
        setSelectedValue(newValue); // Update local state
        onChange(newValue); // Call onChange handler
      }}
      value={GOLONGAN_RUANG_OPTIONS.find((option) => option.value === value)}
      classNamePrefix="react-select"
      // Ensure react-select manages its internal state correctly
      aria-labelledby={`${fieldName}-${genId}`}
      tabSelectsValue={true} // Prevent tab from selecting the value
      menuIsOpen={undefined} // Allow the menu to open/close naturally
      isSearchable={true} // Ensure the select is searchable
    />
  );
};

export default SelectGolonganRuang;
