"use client";
import { getOptionsKelas } from "@/actions/kelas";
import { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";

interface SelectKelasProps {
  inputId: string;
  onChange?: (value: string | null) => void;
  value: string | null;
}

interface Option {
  value: string;
  label: string;
}

const SelectKelas = ({
  inputId,
  onChange = () => {},
  value,
}: SelectKelasProps) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      const optionKelas = await getOptionsKelas();
      if (optionKelas) {
        const mappedOptions = optionKelas.map((kelas) => ({
          value: kelas.value,
          label: kelas.label,
        }));
        setOptions(mappedOptions);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    if (value !== null) {
      const selected = options.find((option) => option.value === value) || null;
      setSelectedOption(selected);
    } else {
      setSelectedOption(null);
    }
  }, [value, options]);

  const handleChange = (selected: SingleValue<Option>) => {
    setSelectedOption(selected);
    onChange(selected ? selected.value : null);
  };

  return (
    <Select
      instanceId={inputId}
      inputId={inputId}
      value={selectedOption}
      onChange={handleChange}
      options={options}
      isClearable
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      }}
    />
  );
};

export default SelectKelas;
