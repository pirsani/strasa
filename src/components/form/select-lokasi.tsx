"use client";
import { randomStrimg } from "@/utils/random-string";
import { LOKASI } from "@prisma-honorarium/client";
import { useState } from "react";
import Select, { SingleValue } from "react-select";

const LOKASI_OPTIONS = [
  { value: LOKASI.DALAM_KOTA, label: "Dalam Kota" },
  { value: LOKASI.LUAR_KOTA, label: "Luar Kota" },
  { value: LOKASI.LUAR_NEGERI, label: "Luar Negeri" },
];
interface Option {
  value: string;
  label: string;
}
interface SelectLokasiProps {
  fieldName: string;
  value: string | null;
  onChange: (value: string | null) => void;
}
const SelectLokasi = ({
  fieldName,
  value,
  onChange = () => {},
}: SelectLokasiProps) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(value);
  const genId = randomStrimg(5);
  return (
    <Select
      instanceId={fieldName}
      id={`${fieldName}}`}
      options={LOKASI_OPTIONS}
      onChange={(option: SingleValue<Option>) => {
        const newValue = option ? option.value : null;
        setSelectedValue(newValue); // Update local state
        onChange(newValue); // Call onChange handler
      }}
      value={LOKASI_OPTIONS.find((option) => option.value === value)}
      classNamePrefix="react-select"
      // Ensure react-select manages its internal state correctly
      aria-labelledby={`${fieldName}`}
    />
  );
};

export default SelectLokasi;
