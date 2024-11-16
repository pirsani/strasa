"use client";
import { TabelGenericWithoutInlineEdit } from "@/components/tabel-generic-without-inline-edit";
import {
  PesertaKegiatanIncludeUh,
  PesertaKegiatanWithUhLuarNegeri,
} from "@/data/kegiatan";
import { useSearchTerm } from "@/hooks/use-search-term";
import { formatTanggal } from "@/utils/date-format";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useEffect, useState } from "react";

interface TabelPesertaKegiatanLuarNegeriProps {
  data: PesertaKegiatanIncludeUh[];
}
export const TabelPesertaKegiatanLuarNegeri = ({
  data: initialData,
}: TabelPesertaKegiatanLuarNegeriProps) => {
  const [pesertaHasUhLuarNegeri, setPesertaHasUhLuarNegeri] = useState<
    PesertaKegiatanWithUhLuarNegeri[]
  >([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRowId, setEditableRowIndex] = useState<string | null>(null);

  const { searchTerm } = useSearchTerm();

  const filteredData = pesertaHasUhLuarNegeri.filter((row) => {
    if (!searchTerm || searchTerm === "") return true;
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    //const searchWords = lowercasedSearchTerm.split(" ").filter(Boolean);
    const searchWords =
      lowercasedSearchTerm
        .match(/"[^"]+"|\S+/g)
        ?.map((word) => word.replace(/"/g, "")) || [];

    return searchWords.every((word) => row.nama?.toLowerCase().includes(word));
  });

  // untuk uh dalam negeri relasinya adalah 1 ke banyak (1 peserta kegiatan bisa memiliki banyak uh luar negeri sesuai itinerary)
  const getPesertaHasUhLuarNegeri = (
    row: PesertaKegiatanIncludeUh[]
  ): PesertaKegiatanWithUhLuarNegeri[] => {
    return row.reduce((acc, r) => {
      if (r.uhLuarNegeri && r.uhLuarNegeri.length > 0) {
        r.uhLuarNegeri.forEach((uh) => {
          acc.push({
            ...r,
            uhLuarNegeri: uh,
          });
        });
      }
      return acc;
    }, [] as PesertaKegiatanWithUhLuarNegeri[]);
  };

  const columnHelper = createColumnHelper<PesertaKegiatanWithUhLuarNegeri>();

  const columns: ColumnDef<PesertaKegiatanWithUhLuarNegeri>[] = [
    {
      id: "rowNumber",
      header: "#",
      // cell: (info) => info.row.index + 1, // Display row number (1-based index)
      footer: "#",
      meta: { className: "w-[50px]" },
    },

    {
      accessorKey: "nama",
      header: "Nama",
      cell: (info) => info.getValue(),
      footer: "Nama",
    },

    {
      accessorKey: "NIP",
      header: "NIP",
      cell: (info) => info.getValue(),
      footer: "Singkatan",
    },
    {
      accessorKey: "tanggalBerangkat",
      header: "Tanggal Berangkat",
      cell: (info) => {
        return formatTanggal(info.getValue() as Date, "dd-M-yyyy");
      },
      footer: "Tanggal Berangkat",
    },
    {
      accessorKey: "tanggalKembali",
      header: "Tanggal Kembali",
      cell: (info) => {
        return formatTanggal(info.getValue() as Date, "dd-M-yyyy");
      },
      footer: "Tanggal Kembali",
    },
    columnHelper.group({
      id: "bank",
      header: () => "Jumlah Hari",
      columns: [
        columnHelper.accessor("uhLuarNegeri.dariLokasiId", {
          cell: (info) => info.getValue(),
          header: "dari",
        }),
        columnHelper.accessor("uhLuarNegeri.keLokasiId", {
          cell: (info) => info.getValue(),
          header: "ke",
        }),
        columnHelper.accessor("uhLuarNegeri.hPerjalanan", {
          cell: (info) => info.getValue(),
          header: "perjalanan",
        }),
        columnHelper.accessor("uhLuarNegeri.hUangHarian", {
          cell: (info) => info.getValue(),
          header: "uang harian",
        }),
        columnHelper.accessor("uhLuarNegeri.hDiklat", {
          cell: (info) => info.getValue(),
          header: "diklat",
        }),
      ],
    }),
  ];

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  useEffect(() => {
    const pesertaHasUhLuarNegeri = getPesertaHasUhLuarNegeri(initialData);
    setPesertaHasUhLuarNegeri(pesertaHasUhLuarNegeri);
  }, [initialData]);
  return (
    <div className="bg-white p-2">
      <TabelGenericWithoutInlineEdit
        data={filteredData}
        columns={columns}
        frozenColumnCount={0}
        isEditing={isEditing}
        editableRowId={editableRowId}
      />
    </div>
  );
};

export default TabelPesertaKegiatanLuarNegeri;
