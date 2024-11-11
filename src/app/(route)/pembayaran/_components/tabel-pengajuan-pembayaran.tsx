"use client";
import { TabelGenericWithoutInlineEdit } from "@/components/tabel-generic-without-inline-edit";
import { Button } from "@/components/ui/button";
import { RiwayatPengajuanIncludeKegiatan } from "@/data/pembayaran";
import { useSearchTerm } from "@/hooks/use-search-term";
import { mapStatusLangkahToDesc, STATUS_PENGAJUAN } from "@/lib/constants";
import { formatTanggal } from "@/utils/date-format";
import { ColumnDef, Row } from "@tanstack/react-table";
import Link from "next/link";
import { useState } from "react";

interface TabelPengajuanPembayaranProps {
  data?: RiwayatPengajuanIncludeKegiatan[];
}
const TabelPengajuanPembayaran = ({
  data: initialData = [],
}: TabelPengajuanPembayaranProps) => {
  const [dataPembayaran, setDataPembayaran] =
    useState<RiwayatPengajuanIncludeKegiatan[]>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRowId, setEditableRowIndex] = useState<string | null>(null);
  const [originalData, setOriginalData] =
    useState<RiwayatPengajuanIncludeKegiatan | null>(null);

  const { searchTerm } = useSearchTerm();
  const sortedDataPembayaran = dataPembayaran.sort((obj1, obj2) => {
    const date1 = new Date(obj1.createdAt);
    const date2 = new Date(obj2.createdAt);
    return date1.getTime() - date2.getTime();
  });
  const filteredData = sortedDataPembayaran.filter((row) => {
    if (!searchTerm || searchTerm === "") return true;
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    //const searchWords = lowercasedSearchTerm.split(" ").filter(Boolean);
    const searchWords =
      lowercasedSearchTerm
        .match(/"[^"]+"|\S+/g)
        ?.map((word) => word.replace(/"/g, "")) || [];

    return searchWords.every(
      (word) =>
        row.kegiatan.nama?.toLowerCase().includes(word) ||
        row.jenis.toLowerCase().includes(word)
    );
  });

  const handleEdit = (row: Row<RiwayatPengajuanIncludeKegiatan>) => {};
  const handleDelete = (row: RiwayatPengajuanIncludeKegiatan) => {};

  const handleGenerate = (jadwalId: string) => {
    console.log(jadwalId);
  };

  const rowRiwayatToHref = (row: RiwayatPengajuanIncludeKegiatan) => {
    const jenisPengajuan = row.jenis;
    let hrefTo = "#";
    switch (jenisPengajuan) {
      case "HONORARIUM":
        hrefTo = `/pembayaran/honorarium/${row.kegiatanId}/${row.id}`;
        break;
      case "UH_DALAM_NEGERI":
      case "UH_LUAR_NEGERI":
        hrefTo = `/pembayaran/uh/${row.kegiatanId}/${row.id}`;
        break;
      default:
        break;
    }
    return hrefTo;
  };

  const columns: ColumnDef<RiwayatPengajuanIncludeKegiatan>[] = [
    {
      id: "rowNumber",
      header: "#",
      // cell: (info) => info.row.index + 1, // Display row number (1-based index)
      footer: "#",
      meta: { className: "w-[50px]" },
    },
    {
      accessorKey: "kegiatan.nama",
      header: "Kegiatan",
      cell: (info) => info.getValue(),
      footer: "Kelas",
    },
    {
      accessorKey: "jenis",
      header: "Pengajuan",
      cell: (info) => info.getValue(),
      footer: "Pengajuan",
    },
    {
      accessorKey: "dimintaPembayaranTanggal",
      header: "Tanggal",
      cell: (info) => {
        const date = formatTanggal(info.getValue() as Date, "dd-M-yyyy");
        return date;
      },
      footer: "Tanggal",
    },
    {
      accessorKey: "keterangan",
      header: "Keterangan",
      cell: (info) => info.getValue(),
      footer: "Keterangan",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => {
        return mapStatusLangkahToDesc(info.getValue() as STATUS_PENGAJUAN);
      },
      footer: "Status",
    },

    {
      accessorKey: "_additionalKolomAksi",
      header: "Aksi",
      cell: ({ row }) => {
        const hrefTo = rowRiwayatToHref(row.original);
        return (
          <div className="flex gap-2">
            <Link href={hrefTo}>
              <Button variant="secondary">Detail</Button>
            </Link>
          </div>
        );
      },
      meta: { isKolomAksi: true, className: "w-[100px]" },
      enableSorting: false, // Disable sorting for this column
    },
  ];

  return (
    <div>
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

export default TabelPengajuanPembayaran;
