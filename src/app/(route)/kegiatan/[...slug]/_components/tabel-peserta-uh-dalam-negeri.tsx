"use client";
import { TabelGenericWithoutInlineEdit } from "@/components/tabel-generic-without-inline-edit";
import { PesertaKegiatanIncludeUh } from "@/data/kegiatan";
import { useSearchTerm } from "@/hooks/use-search-term";
import { formatTanggal } from "@/utils/date-format";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useEffect, useState } from "react";

interface TabelPesertaKegiatanDalamNegeriProps {
  data: PesertaKegiatanIncludeUh[];
}
export const TabelPesertaKegiatanDalamNegeri = ({
  data: initialData,
}: TabelPesertaKegiatanDalamNegeriProps) => {
  const [pesertaHasUhDalamNegeri, setPesertaHasUhDalamNegeri] = useState<
    PesertaKegiatanIncludeUh[]
  >([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRowId, setEditableRowIndex] = useState<string | null>(null);

  const { searchTerm } = useSearchTerm();

  const filteredData = pesertaHasUhDalamNegeri.filter((row) => {
    if (!searchTerm || searchTerm === "") return true;
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    //const searchWords = lowercasedSearchTerm.split(" ").filter(Boolean);
    const searchWords =
      lowercasedSearchTerm
        .match(/"[^"]+"|\S+/g)
        ?.map((word) => word.replace(/"/g, "")) || [];

    return searchWords.every((word) => row.nama?.toLowerCase().includes(word));
  });

  // untuk uh dalam negeri relasinya adalah 1 ke 1
  const getPesertaHasUhDalamNegeri = (row: PesertaKegiatanIncludeUh[]) => {
    return row.filter(
      (r) => r.uhDalamNegeri !== undefined && r.uhDalamNegeri !== null
    );
  };

  const columnHelper = createColumnHelper<PesertaKegiatanIncludeUh>();

  const columns: ColumnDef<PesertaKegiatanIncludeUh>[] = [
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
        columnHelper.accessor("uhDalamNegeri.hFullboard", {
          cell: (info) => info.getValue(),
          header: "fullboard",
        }),
        columnHelper.accessor("uhDalamNegeri.hFulldayHalfday", {
          cell: (info) => info.getValue(),
          header: "full day/half day",
        }),
        columnHelper.accessor("uhDalamNegeri.hLuarKota", {
          cell: (info) => info.getValue(),
          header: "luar kota",
        }),
        columnHelper.accessor("uhDalamNegeri.hDalamKota", {
          cell: (info) => info.getValue(),
          header: "dalam kota",
        }),
        columnHelper.accessor("uhDalamNegeri.hDiklat", {
          cell: (info) => info.getValue(),
          header: "diklat",
        }),
        columnHelper.accessor("uhDalamNegeri.hTransport", {
          cell: (info) => info.getValue(),
          header: "transport",
        }),
      ],
    }),
  ];

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  useEffect(() => {
    const pesertaHasUhDalamNegeri = getPesertaHasUhDalamNegeri(initialData);
    setPesertaHasUhDalamNegeri(pesertaHasUhDalamNegeri);
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

export default TabelPesertaKegiatanDalamNegeri;
