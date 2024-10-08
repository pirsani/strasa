"use client";
import { deletePengguna, PenggunaWithRoles } from "@/actions/pengguna";
import ConfirmDialog from "@/components/confirm-dialog";
import { KolomAksi, TabelGeneric } from "@/components/tabel-generic";
import { useSearchTerm } from "@/hooks/use-search-term";

import { ColumnDef, Row } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TabelPenggunaProps {
  data: PenggunaWithRoles[];
  optionsRole: { value: string; label: string }[];
  onEdit: (row: PenggunaWithRoles) => void;
}
export const TabelPengguna = ({
  data: initialData,
  optionsRole,
  onEdit = () => {},
}: TabelPenggunaProps) => {
  const [data, setData] = useState<PenggunaWithRoles[]>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRowId, setEditableRowIndex] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState<PenggunaWithRoles | null>(
    null
  );

  const { searchTerm } = useSearchTerm();

  const filteredData = data.filter((row) => {
    if (!searchTerm || searchTerm === "") return true;
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    //const searchWords = lowercasedSearchTerm.split(" ").filter(Boolean);
    const searchWords =
      lowercasedSearchTerm
        .match(/"[^"]+"|\S+/g)
        ?.map((word) => word.replace(/"/g, "")) || [];

    return searchWords.every((word) => row.name?.toLowerCase().includes(word));
  });

  const columns: ColumnDef<PenggunaWithRoles>[] = [
    {
      id: "rowNumber",
      header: "#",
      // cell: (info) => info.row.index + 1, // Display row number (1-based index)
      footer: "#",
      meta: { className: "w-[50px]" },
    },

    {
      accessorKey: "name",
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
      accessorKey: "organisasi.nama",
      header: "Unit Kerja",
      cell: (info) => info.getValue(),
      footer: "Unit Kerja",
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: (info) => info.getValue(),
      footer: "email",
    },

    {
      accessorKey: "_additionalKolomAksi",
      header: "Aksi",
      cell: (info) =>
        KolomAksi<PenggunaWithRoles>(
          info,
          handleEdit,
          handleDelete,
          handleOnSave,
          handleUndoEdit,
          isEditing
        ),
      meta: { isKolomAksi: true, className: "w-[100px]" },
      enableSorting: false, // Disable sorting for this column
    },
  ];

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const handleDelete = async (row: PenggunaWithRoles) => {
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
      toast.success(`Data ${originalData.name} berhasil dihapus`);
      setIsConfirmDialogOpen(false);
      console.log("Data dihapus");
    } else {
      console.log("Data tidak dihapus");
      toast.error(`Data ${originalData.name} gagal dihapus ${deleted.message}`);
    }
  };

  const handleEdit = (row: Row<PenggunaWithRoles>) => {
    console.log("Edit row:", row);
    // Implement your edit logic here
    setOriginalData(row.original); // Store the original data
    // edit on parent component
    onEdit(row.original);
  };

  const handleOnSave = (row: PenggunaWithRoles) => {};

  const handleUndoEdit = (row: PenggunaWithRoles) => {};

  const handleCancel = () => {};

  useEffect(() => {
    setData(initialData);
  }, [initialData]);
  return (
    <div>
      <TabelGeneric
        data={filteredData}
        columns={columns}
        frozenColumnCount={1}
        isEditing={isEditing}
        editableRowId={editableRowId}
      />
      <ConfirmDialog
        message={`Apakah anda yakin menghapus data ${originalData?.name} ?`}
        isOpen={isConfirmDialogOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default TabelPengguna;
