"use client";
import {
  deleteDataKelas,
  kelasWithKegiatan,
  simpanDataKelas,
  updateDataKelas,
} from "@/actions/kelas";
import ConfirmDialog from "@/components/confirm-dialog";
import { KolomAksi, TabelGeneric } from "@/components/tabel-generic";
import { useSearchTerm } from "@/hooks/use-search-term";
import { kelasSchema, Kelas as Zkelas } from "@/zod/schemas/kelas";
import { Kelas } from "@prisma-honorarium/client";

import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  Table,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ZodError } from "zod";

interface TabelKelasProps {
  data: kelasWithKegiatan[];
  optionsKegiatan: { value: string; label: string }[];
}
export const TabelKelas = ({
  data: initialData,
  optionsKegiatan,
}: TabelKelasProps) => {
  const [data, setData] = useState<kelasWithKegiatan[]>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRowId, setEditableRowIndex] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState<kelasWithKegiatan | null>(
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

    return searchWords.every(
      (word) =>
        row.nama.toLowerCase().includes(word) ||
        row.kode?.toLowerCase().includes(word) ||
        row.kegiatan.nama.toLowerCase().includes(word)
    );
  });

  const columns: ColumnDef<kelasWithKegiatan>[] = [
    {
      id: "rowNumber",
      header: "#",
      // cell: (info) => info.row.index + 1, // Display row number (1-based index)
      footer: "#",
    },
    {
      accessorKey: "kegiatan.nama",
      header: "Kegiatan",
      cell: (info) => info.getValue(),
      footer: "Provinsi",
      meta: {
        inputType: "select",
        options: optionsKegiatan,
        field: "kegiatanId",
      },
    },
    {
      accessorKey: "kode",
      header: "Kode",
      cell: (info) => info.getValue(),
      footer: "Kode",
    },

    {
      accessorKey: "nama",
      header: "Nama",
      cell: (info) => info.getValue(),
      footer: "Nama",
    },
    {
      accessorKey: "_additionalKolomAksi",
      header: "Aksi",
      cell: (info) =>
        KolomAksi<kelasWithKegiatan>(
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

  const handleDelete = async (row: kelasWithKegiatan) => {
    setIsConfirmDialogOpen(true);
    setOriginalData(row);
  };

  const handleConfirm = async () => {
    if (!originalData) {
      toast.error("Data tidak ditemukan");
      return;
    }
    const deleted = await deleteDataKelas(originalData.id);
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

  const handleView = (row: Kelas) => {
    console.log("View row:", row);
    // Implement your view logic here
    // view pdf
  };

  const handleEdit = (row: Row<kelasWithKegiatan>) => {
    console.log("Edit row:", row);
    // Implement your edit logic here
    setOriginalData(row.original); // Store the original data

    setIsEditing(true);
    setEditableRowIndex(row.id);
  };

  const handleOnSave = async (row: kelasWithKegiatan) => {
    console.log("Save row:", row);
    // Implement your save logic here

    try {
      const parsed = kelasSchema.parse(row);
      const update = await updateDataKelas(parsed, row.id);
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

  const handleUndoEdit = (row: kelasWithKegiatan) => {
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

export default TabelKelas;
