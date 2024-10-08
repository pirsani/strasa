"use client";
import { deleteDataNegara, updateDataNegara } from "@/actions/negara";
import ConfirmDialog from "@/components/confirm-dialog";
import { KolomAksi, TabelGeneric } from "@/components/tabel-generic";
import { useSearchTerm } from "@/hooks/use-search-term";
import { negaraSchema } from "@/zod/schemas/negara";
import { Negara } from "@prisma-honorarium/client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ZodError } from "zod";

interface TabelNegaraProps {
  data: Negara[];
}
export const TabelNegara = ({ data: initialData }: TabelNegaraProps) => {
  const [data, setData] = useState<Negara[]>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRowId, setEditableRowIndex] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState<Negara | null>(null);
  const { searchTerm } = useSearchTerm();

  const filteredData = data.filter((row) => {
    if (!searchTerm || searchTerm === "") return true;
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    //const searchWords = lowercasedSearchTerm.split(" ").filter(Boolean);
    const searchWords =
      lowercasedSearchTerm
        .match(/"[^"]+"|\S+/g)
        ?.map((word) => word.replace(/"/g, "")) || [];

    return searchWords.every(
      (word) =>
        row.nama?.toLowerCase().includes(word) ||
        row.namaInggris.toString().toLowerCase().includes(word) ||
        row.kodeAlpha2.toString().toLowerCase().includes(word) ||
        row.kodeAlpha3.toString().toLowerCase().includes(word) ||
        row.kodeNumeric.toString().toLowerCase().includes(word)
    );
  });

  const columns: ColumnDef<Negara>[] = [
    {
      id: "rowNumber",
      header: "#",
      // cell: (info) => info.row.index + 1, // Display row number (1-based index)
      footer: "#",
    },
    {
      accessorKey: "nama",
      header: "Nama",
      cell: (info) => info.getValue(),
      footer: "Kode",
    },

    {
      accessorKey: "namaInggris",
      header: "Nama(EN)",
      cell: (info) => info.getValue(),
      footer: "Nama(EN)",
    },
    {
      accessorKey: "kodeAlpha2",
      header: "Kode Alpha2",
      cell: (info) => info.getValue(),
      footer: "Kode Alpha2",
    },
    {
      accessorKey: "kodeAlpha3",
      header: "Kode Alpha3",
      cell: (info) => info.getValue(),
      footer: "Kode Alpha3",
    },
    {
      accessorKey: "kodeNumeric",
      header: "Kode Numeric",
      cell: (info) => info.getValue(),
      footer: "Kode Numeric",
    },
    {
      accessorKey: "urutan",
      header: "Urutan",
      cell: (info) => {
        const value = info.getValue();
        return value !== null ? value : "n/a";
      },
      sortingFn: (rowA, rowB, columnId) => {
        const a = rowA.getValue(columnId) as number | null;
        const b = rowB.getValue(columnId) as number | null;
        if (a === null && b === null) return 0;
        if (a === null) return 1;
        if (b === null) return -1;
        return a - b;
      },
      footer: "Urutan",
    },
    {
      accessorKey: "_additionalKolomAksi",
      header: "Aksi",
      cell: (info) =>
        KolomAksi<Negara>(
          info,
          handleEdit,
          handleDelete,
          handleOnSave,
          handleUndoEdit,
          isEditing
        ),
      meta: { isKolomAksi: true },
      enableSorting: false, // Disable sorting for this column
    },
  ];

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const handleDelete = async (row: Negara) => {
    setIsConfirmDialogOpen(true);
    setOriginalData(row);
  };

  const handleConfirm = async () => {
    if (!originalData) {
      toast.error("Data tidak ditemukan");
      return;
    }
    const deleted = await deleteDataNegara(originalData.id);
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

  const handleView = (row: Negara) => {
    console.log("View row:", row);
    // Implement your view logic here
    // view pdf
  };

  const handleEdit = (row: Row<Negara>) => {
    console.log("Edit row:", row);
    // Implement your edit logic here
    setOriginalData(row.original); // Store the original data

    setIsEditing(true);
    setEditableRowIndex(row.id);
  };

  const handleOnSave = async (row: Negara) => {
    console.log("Save row:", row);
    // Implement your save logic here

    try {
      const parsed = negaraSchema.parse(row);
      const update = await updateDataNegara(parsed, row.id);
      if (update.success) {
        console.log("Data berhasil disimpan");
        toast.success("Data berhasil disimpan");
      } else {
        console.error("Data gagal disimpan");
        toast.error("Data gagal disimpan");
      }
      setEditableRowIndex(null);
      setIsEditing(false);
    } catch (error) {
      if (error instanceof ZodError) {
        //setErrors(error);
      } else {
        console.error("Error saving row:", error);
      }
      console.error("Error saving row:", error);
    }
  };

  const handleUndoEdit = (row: Negara) => {
    console.log("Undo edit row:", row);
    // Implement your undo edit logic here
    if (originalData) {
      setData((prevData) =>
        prevData.map((item) => (item.id === row.id ? originalData : item))
      );
    }
    setIsEditing(false);
    setEditableRowIndex(null);
  };

  const handleCancel = () => {
    setIsConfirmDialogOpen(false);
    console.log("Cancelled!");
  };

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
        message={`Apakah anda yakin menghapus data ${originalData?.nama} ?`}
        isOpen={isConfirmDialogOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default TabelNegara;
