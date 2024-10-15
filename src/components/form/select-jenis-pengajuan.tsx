"use client";
import { randomStrimg } from "@/utils/random-string";
import { useState } from "react";
import Select, { SingleValue } from "react-select";

export type JenisPengajuan = "HONORARIUM" | "UH" | null;

const JENIS_PENGAJUAN_OPTIONS: Option[] = [
  { value: null, label: "-" },
  { value: "HONORARIUM", label: "Honorarium" },
  { value: "UH", label: "Uang Harian" },
];
interface Option {
  value: JenisPengajuan | null;
  label: string;
}
interface SelectJenisPengajuanProps {
  fieldName: string;
  value?: JenisPengajuan | string | null;
  onChange: (value: JenisPengajuan | null) => void;
}
export const SelectJenisPengajuan = ({
  fieldName,
  value: initValue,
  onChange = () => {},
}: SelectJenisPengajuanProps) => {
  const value = initValue as JenisPengajuan | null;
  const [selectedValue, setSelectedValue] = useState<JenisPengajuan | null>(
    value ?? null
  );
  const genId = randomStrimg(5);
  return (
    <Select
      placeholder="Pilih Jenis Pengajuan"
      instanceId={`${fieldName}-${genId}`}
      id={`${fieldName}-${genId}`}
      options={JENIS_PENGAJUAN_OPTIONS}
      onChange={(option: SingleValue<Option>) => {
        const newValue = option ? option.value : null;
        setSelectedValue(newValue); // Update local state
        onChange(newValue); // Call onChange handler
      }}
      value={JENIS_PENGAJUAN_OPTIONS.find((option) => option.value === value)}
      classNamePrefix="react-select"
      // Ensure react-select manages its internal state correctly
      aria-labelledby={`${fieldName}-${genId}`}
      tabSelectsValue={true} // Prevent tab from selecting the value
      menuIsOpen={undefined} // Allow the menu to open/close naturally
      isSearchable={true} // Ensure the select is searchable
    />
  );
};

export default SelectJenisPengajuan;
