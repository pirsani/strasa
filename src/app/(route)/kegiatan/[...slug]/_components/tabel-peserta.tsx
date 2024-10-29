"use client";
import { deletePengguna } from "@/actions/pengguna";
import ConfirmDialog from "@/components/confirm-dialog";
import { TabelGenericWithoutInlineEdit } from "@/components/tabel-generic-without-inline-edit";
import { PesertaKegiatanIncludeUh } from "@/data/kegiatan";
import { useSearchTerm } from "@/hooks/use-search-term";
import { formatTanggal } from "@/utils/date-format";

import { ColumnDef, Row } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TabelPesertaKegiatanProps {
  data: PesertaKegiatanIncludeUh[];
}
export const TabelPesertaKegiatan = ({
  data: initialData,
}: TabelPesertaKegiatanProps) => {
  const [data, setData] = useState<PesertaKegiatanIncludeUh[]>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRowId, setEditableRowIndex] = useState<string | null>(null);
  const [originalData, setOriginalData] =
    useState<PesertaKegiatanIncludeUh | null>(null);

  const { searchTerm } = useSearchTerm();

  const filteredData = data.filter((row) => {
    if (!searchTerm || searchTerm === "") return true;
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    //const searchWords = lowercasedSearchTerm.split(" ").filter(Boolean);
    const searchWords =
      lowercasedSearchTerm
        .match(/"[^"]+"|\S+/g)
        ?.map((word) => word.replace(/"/g, "")) || [];

    return searchWords.every((word) => row.nama?.toLowerCase().includes(word));
  });

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
        return formatTanggal(info.getValue() as Date);
      },
      footer: "Tanggal Berangkat",
    },
    {
      accessorKey: "tanggalKembali",
      header: "Tanggal Kembali",
      cell: (info) => {
        return formatTanggal(info.getValue() as Date);
      },
      footer: "Tanggal Kembali",
    },
  ];

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const handleDelete = async (row: PesertaKegiatanIncludeUh) => {
    setIsConfirmDialogOpen(true);
    setOriginalData(row);
  };

  const handleConfirm = async () => {
    if (!originalData) {
      toast.error("Data tidak ditemukan");
      return;
    }
    const deleted = await deletePengguna(originalData.id);
    if (deleted.success) {
      //alert("Data berhasil dihapus");
      toast.success(`Data ${originalData.nama} berhasil dihapus`);
      setIsConfirmDialogOpen(false);
      console.log("Data dihapus");
    } else {
      console.log("Data tidak dihapus");
      toast.error(`Data ${originalData.nama} gagal dihapus ${deleted.message}`);
    }
  };

  const handleEdit = (row: Row<PesertaKegiatanIncludeUh>) => {
    console.log("Edit row:", row);
    // Implement your edit logic here
    setOriginalData(row.original); // Store the original data
    // edit on parent component
  };

  const handleOnSave = (row: PesertaKegiatanIncludeUh) => {};

  const handleUndoEdit = (row: PesertaKegiatanIncludeUh) => {};

  const handleCancel = () => {};

  useEffect(() => {
    setData(initialData);
  }, [initialData]);
  return (
    <div className="bg-white p-2 mt-2 rounded-sm">
      <TabelGenericWithoutInlineEdit
        data={filteredData}
        columns={columns}
        frozenColumnCount={0}
        isEditing={isEditing}
        editableRowId={editableRowId}
      />
      <ConfirmDialog
        message={`Apakah anda yakin menghapus data ${originalData?.nama} ?`}
        isOpen={isConfirmDialogOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default TabelPesertaKegiatan;
