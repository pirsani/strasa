"use client";
import { getOptionsJadwalDisetujui, OptionJadwal } from "@/actions/honorarium";
import { formatTanggal } from "@/utils/date-format";
import { useEffect, useState } from "react";
import { default as Select, SingleValue } from "react-select";

interface SelectJadwalHonorariumProps {
  kegiatanId: string;
  fieldName: string;
  onChange: (value: string | null) => void;
  value: string | null;
}

export const SelectJadwalHonorarium = ({
  kegiatanId,
  fieldName,
  onChange,
  value,
}: SelectJadwalHonorariumProps) => {
  const [options, setOptions] = useState<OptionJadwal[]>([]);
  const [selectedValue, setSelectedValue] = useState<string | null>(value);

  useEffect(() => {
    const fetchOptions = async () => {
      const optionJadwalHonorarium = await getOptionsJadwalDisetujui(
        kegiatanId
      );
      if (optionJadwalHonorarium) {
        // const mappedOptions = optionJadwalHonorarium.map(
        //   (jadwalHonorarium) => ({
        //     value: jadwalHonorarium.value,
        //     label: jadwalHonorarium.label,
        //   })
        // );
        setOptions(optionJadwalHonorarium);

        console.log("mappedOptions", optionJadwalHonorarium);

        // Set default value after options are loaded
        if (value) {
          console.log("value", value);
          const defaultOption = optionJadwalHonorarium.find(
            (option) => option.value === value
          );
          console.log("defaultOption", defaultOption);
          setSelectedValue(defaultOption ? defaultOption.value : null);
        }
      }
    };

    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kegiatanId]);

  return (
    <Select
      instanceId={fieldName}
      options={options}
      isClearable
      onChange={(option: SingleValue<OptionJadwal>) => {
        const newValue = option ? option.value : null;
        setSelectedValue(newValue); // Update local state
        onChange(newValue); // Call onChange handler
      }}
      value={options.find((option) => option.value === selectedValue) || null}
      getOptionLabel={(option) => option.label}
      getOptionValue={(option) => option.value.toString()}
      filterOption={customFilterOption}
      formatOptionLabel={(option: OptionJadwal) => (
        <div className="flex flex-col">
          <div className="flex flex-row gap-2">
            <span className="font-semibold">{option.kelas}</span>
            <span className="font-semibold">-</span>
            <span className="font-semibold">{option.materi}</span>
          </div>
          <div>{formatTanggal(option.tanggal)}</div>
        </div>
      )}
    />
  );
};

// Define the custom filter option function with proper TypeScript types
const customFilterOption = (
  option: { data: OptionJadwal }, // Adjust this type based on your setup
  rawInput: string
): boolean => {
  const searchTerm = rawInput.toLowerCase();
  const { label, materi, kelas, tanggal } = option.data;

  const formattedTanggal = formatTanggal(tanggal);
  //const { profession, institution, email } = guest;

  // Return true if any field matches the search term, otherwise false
  // Return true if any field matches the search term, otherwise false
  return (
    label.toLowerCase().includes(searchTerm) ||
    (materi?.toLowerCase().includes(searchTerm) ?? false) ||
    (kelas?.toLowerCase().includes(searchTerm) ?? false) ||
    (formattedTanggal?.toLowerCase().includes(searchTerm) ?? false)
  );
};

export default SelectJadwalHonorarium;
