"use client";
import { getOptionsUnitKerja } from "@/actions/unit-kerja";
import { randomStrimg } from "@/utils/random-string";
import { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";

interface SelectUnitKerjaProps {
  fieldName: string;
  onChange: (value: string | null) => void;
  value: string | null;
  indukOrganisasiId?: string;
}

interface Option {
  value: string;
  label: string;
}

const SelectUnitKerja = ({
  fieldName,
  onChange,
  value,
  indukOrganisasiId,
}: SelectUnitKerjaProps) => {
  const [options, setOptions] = useState<Option[]>([]);
  const genId = randomStrimg(5);

  useEffect(() => {
    const fetchOptions = async () => {
      const optionUnitKerja = await getOptionsUnitKerja(indukOrganisasiId);
      if (optionUnitKerja) {
        const mappedOptions = optionUnitKerja.map((unitKerja) => ({
          value: unitKerja.value,
          label: unitKerja.label,
        }));
        setOptions(mappedOptions);
      }
    };

    fetchOptions();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Select
      className="w-full flex-grow-0"
      instanceId={fieldName}
      inputId={`${fieldName}-${genId}`}
      options={options}
      isClearable
      onChange={(option: SingleValue<Option>) =>
        onChange(option ? option.value : null)
      }
      value={options.find((option) => option.value === value) || null}
      getOptionLabel={(option) => option.label}
      getOptionValue={(option) => option.value.toString()}
      filterOption={(option, inputValue) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      }
      //menuPortalTarget={document.body} // Ensure the menu is rendered in the document body so it doesn't get clipped by overflow:hidden containers
      //styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }} // Ensure the menu has a high z-index
      aria-labelledby={`${fieldName}-${genId}`}
    />
  );
};

export default SelectUnitKerja;
