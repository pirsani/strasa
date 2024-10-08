import { randomStrimg } from "@/utils/random-string";
import { useState } from "react";
import Select, { SingleValue } from "react-select";

// hardocded options
const JENIS_JABATAN_PERBENDAHARAAN = [
  { value: "KPA", label: "Kuasa Pengguna Anggaran" },
  { value: "PPK", label: "Pejabat Pembuat Komitmen" },
  { value: "bendahara-pengeluaran", label: "Bendahara Pengeluaran" },
  { value: "bendahara-penerimaan", label: "Bendahara Penerimaan" },
  { value: "PPSPM", label: "Pejabat Penandatangan Surat Perintah Membayar " },
];
interface Option {
  value: string;
  label: string;
}
interface SelectJenisJabatanPerbendaharaanProps {
  fieldName: string;
  value: string | null;
  onChange: (value: string | null) => void;
}
const SelectJenisJabatanPerbendaharaan = ({
  fieldName,
  value,
  onChange = () => {},
}: SelectJenisJabatanPerbendaharaanProps) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(value);
  const genId = randomStrimg(5);
  return (
    <Select
      instanceId={fieldName}
      id={`${fieldName}-${genId}`}
      options={JENIS_JABATAN_PERBENDAHARAAN}
      onChange={(option: SingleValue<Option>) => {
        const newValue = option ? option.value : null;
        setSelectedValue(newValue); // Update local state
        onChange(newValue); // Call onChange handler
      }}
      value={JENIS_JABATAN_PERBENDAHARAAN.find(
        (option) => option.value === value
      )}
      classNamePrefix="react-select"
      // Ensure react-select manages its internal state correctly
      aria-labelledby={`${fieldName}-${genId}`}
    />
  );
};

export default SelectJenisJabatanPerbendaharaan;
