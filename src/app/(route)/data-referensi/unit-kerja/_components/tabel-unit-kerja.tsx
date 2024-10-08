"use client";
import {
  deleteDataUnitKerja,
  simpanDataUnitKerja,
  UnitKerjaWithInduk,
  updateDataUnitKerja,
} from "@/actions/unit-kerja";
import ConfirmDialog from "@/components/confirm-dialog";
import { KolomAksi, TabelGeneric } from "@/components/tabel-generic";
import { useSearchTerm } from "@/hooks/use-search-term";
import {
  unitKerjaSchema,
  UnitKerja as ZunitKerja,
} from "@/zod/schemas/unit-kerja";
import { Organisasi as UnitKerja } from "@prisma-honorarium/client";

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

interface TabelUnitKerjaProps {
  data: UnitKerjaWithInduk[];
  optionsUnitKerja: { value: string; label: string }[];
  onEdit: (row: UnitKerjaWithInduk) => void;
}
export const TabelUnitKerja = ({
  data: initialData,
  optionsUnitKerja,
  onEdit = () => {},
}: TabelUnitKerjaProps) => {
  const [data, setData] = useState<UnitKerjaWithInduk[]>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRowId, setEditableRowIndex] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState<UnitKerjaWithInduk | null>(
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
        row.nama?.toLowerCase().includes(word) ||
        row.singkatan?.toLowerCase().includes(word) ||
        row.indukOrganisasi?.nama?.toLowerCase().includes(word)
    );
  });

  const columns: ColumnDef<UnitKerjaWithInduk>[] = [
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
      footer: "Nama",
    },

    {
      accessorKey: "singkatan",
      header: "Singkatan",
      cell: (info) => info.getValue(),
      footer: "Singkatan",
    },
    {
      accessorKey: "eselon",
      header: "Eselon",
      cell: (info) => info.getValue(),
      footer: "Eselon",
    },
    {
      accessorKey: "indukOrganisasi.nama",
      header: "Induk Organisasi",
      cell: (info) => info.row.original.indukOrganisasi?.nama ?? "N/A", // Use optional chaining and provide a fallback value
      footer: "Induk Organisasi",
      meta: {
        inputType: "select",
        options: optionsUnitKerja,
        field: "indukOrganisasiId",
      },
    },
    {
      accessorKey: "_additionalKolomAksi",
      header: "Aksi",
      cell: (info) =>
        KolomAksi<UnitKerjaWithInduk>(
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

  const handleDelete = async (row: UnitKerjaWithInduk) => {
    setIsConfirmDialogOpen(true);
    setOriginalData(row);
  };

  const handleConfirm = async () => {
    if (!originalData) {
      toast.error("Data tidak ditemukan");
      return;
    }
    const deleted = await deleteDataUnitKerja(originalData.id);
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

  const handleView = (row: UnitKerja) => {
    console.log("View row:", row);
    // Implement your view logic here
    // view pdf
  };

  const handleEdit = (row: Row<UnitKerjaWithInduk>) => {
    console.log("Edit row:", row);
    // Implement your edit logic here
    setOriginalData(row.original); // Store the original data

    onEdit(row.original);
    // setIsEditing(true);
    // setEditableRowIndex(row.id);
  };

  const handleOnSave = async (row: UnitKerjaWithInduk) => {
    console.log("Save row:", row);
    // Implement your save logic here
    //convert back kegiatanId as number
    //row.kegiatanId = Number(row.kegiatanId);

    try {
      const parsed = unitKerjaSchema.parse(row);
      const update = await updateDataUnitKerja(parsed, row.id);
      if (update.success) {
        console.log(update.data);
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
        toast.error("Data gagal disimpan");
      } else {
        console.error("Error saving row:", error);
      }
      console.error("Error saving row:", error);
    }
  };

  const handleUndoEdit = (row: UnitKerjaWithInduk) => {
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

export default TabelUnitKerja;
