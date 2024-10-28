"use client";
import { KegiatanWithDetail } from "@/actions/kegiatan";
import { getJenisPengajuan } from "@/lib/constants";
import { randomStrimg } from "@/utils/random-string";
import { JENIS_PENGAJUAN } from "@prisma-honorarium/client";
import { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";

export type JenisPengajuan = JENIS_PENGAJUAN;

interface Option {
  value: JENIS_PENGAJUAN | null;
  label: string;
}

const JENIS_PENGAJUAN_OPTIONS: Option[] = [
  { value: null, label: "-" },
  { value: "HONORARIUM", label: "Honorarium" },
  { value: "UH_LUAR_NEGERI", label: "Uang Harian Luar Negeri" },
  { value: "UH_DALAM_NEGERI", label: "Uang Harian Dalam Negeri" },
];

interface SelectJenisPengajuanProps {
  fieldName: string;
  value?: JENIS_PENGAJUAN | string | null;
  onChange: (value: JENIS_PENGAJUAN | null) => void;
  kegiatan?: KegiatanWithDetail | null;
}
export const SelectJenisPengajuan = ({
  fieldName,
  value: initValue,
  onChange = () => {},
  kegiatan,
}: SelectJenisPengajuanProps) => {
  const value = getJenisPengajuan(initValue);
  const [selectedValue, setSelectedValue] = useState<JENIS_PENGAJUAN | null>(
    value ?? null
  );
  const genId = randomStrimg(5);
  const [options, setOptions] = useState<Option[]>(
    createOptionsBaseOnKegiatan(kegiatan)
  );

  useEffect(() => {
    setOptions(createOptionsBaseOnKegiatan(kegiatan));
    console.log("kegiatan", kegiatan);
  }, [kegiatan]);

  useEffect(() => {
    setSelectedValue(value ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initValue]);

  if (!kegiatan) {
    return null;
  }

  return (
    <Select
      placeholder="Pilih Jenis Pengajuan"
      instanceId={`${fieldName}-${genId}`}
      id={`${fieldName}-${genId}`}
      options={options}
      onChange={(option: SingleValue<Option>) => {
        const newValue = option ? option.value : null;
        setSelectedValue(newValue); // Update local state
        onChange(newValue); // Call onChange handler
      }}
      value={
        selectedValue
          ? options.find((option) => option.value === selectedValue)
          : null
      }
      classNamePrefix="react-select"
      // Ensure react-select manages its internal state correctly
      aria-labelledby={`${fieldName}-${genId}`}
      tabSelectsValue={true} // Prevent tab from selecting the value
      menuIsOpen={undefined} // Allow the menu to open/close naturally
      isSearchable={true} // Ensure the select is searchable
    />
  );
};

const createOptionsBaseOnKegiatan = (
  kegiatan?: KegiatanWithDetail | null
): Option[] => {
  if (!kegiatan) {
    return JENIS_PENGAJUAN_OPTIONS;
  }

  const pengajuanUhLuarNegeri = kegiatan.riwayatPengajuan?.find(
    (pengajuan) => pengajuan.jenis === "UH_LUAR_NEGERI"
  );

  const pengajuanUhDalamNegeri = kegiatan.riwayatPengajuan?.find(
    (pengajuan) => pengajuan.jenis === "UH_DALAM_NEGERI"
  );

  let options: Option[] = [
    {
      value: "HONORARIUM",
      label: "Honorarium",
    },
  ];
  if (
    kegiatan.lokasi !== "LUAR_NEGERI" &&
    pengajuanUhDalamNegeri?.status === "APPROVED"
  ) {
    options.push({
      value: "UH_DALAM_NEGERI",
      label: "Uang harian",
    });
  } else if (
    kegiatan.lokasi === "LUAR_NEGERI" &&
    pengajuanUhLuarNegeri?.status === "APPROVED"
  ) {
    options.push({
      value: "UH_LUAR_NEGERI",
      label: "Uang harian",
    });
  }

  return options;
};

export default SelectJenisPengajuan;
