"use client";
import {
  deleteDataSbmUhLuarNegeri,
  updateDataSbmUhLuarNegeri,
} from "@/actions/sbm/uh-luar-negeri";
import ZodErrorList from "@/approute/data-referensi/_components/zod-error-list";
import ConfirmDialog from "@/components/confirm-dialog";
import {
  formatCurrency,
  KolomAksi,
  TabelGeneric,
} from "@/components/tabel-generic";
import { SbmUhLuarNegeriPlainObject } from "@/data/sbm-uh-luar-negeri";
import { useSearchTerm } from "@/hooks/use-search-term";
import { sbmUhLuarNegeriSchema } from "@/zod/schemas/sbm-uh-luar-negeri";
import { ColumnDef, createColumnHelper, Row } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ZodError } from "zod";

const data: SbmUhLuarNegeriPlainObject[] = [];

interface TabelSbmUhLuarNegeriProps {
  data: SbmUhLuarNegeriPlainObject[];
  optionsNegara: { value: string; label: string }[];
  frozenColumnCount?: number;
}
export const TabelSbmUhLuarNegeri = ({
  data: initialData,
  optionsNegara,
  frozenColumnCount = 2,
}: TabelSbmUhLuarNegeriProps) => {
  const [data, setData] = useState<SbmUhLuarNegeriPlainObject[]>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRowId, setEditableRowIndex] = useState<string | null>(null);
  const [originalData, setOriginalData] =
    useState<SbmUhLuarNegeriPlainObject | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [errors, setErrors] = useState<ZodError | null>(null);
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
        row.negara.nama?.toLowerCase().includes(word) ||
        row.tahun.toString().toLowerCase().includes(word)
    );
  });

  const columnHelper = createColumnHelper<SbmUhLuarNegeriPlainObject>();
  const columns: ColumnDef<SbmUhLuarNegeriPlainObject>[] = [
    {
      id: "rowNumber",
      header: "#",
      // cell: (info) => info.row.index + 1, // Display row number (1-based index)
      footer: "#",
    },
    {
      accessorKey: "negara.nama",
      header: "Negara",
      cell: (info) => info.getValue(),
      footer: "Negara",
      meta: {
        isCellEditable: false, // Disable cell editing for this column
      },
    },
    {
      accessorKey: "satuan",
      header: "Satuan",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "golonganA",
      header: "Golongan A",
      cell: (info) => formatCurrency<SbmUhLuarNegeriPlainObject>(info, "USD"),
    },
    {
      accessorKey: "golonganB",
      header: "Golongan B",
      cell: (info) => formatCurrency<SbmUhLuarNegeriPlainObject>(info, "USD"),
    },
    {
      accessorKey: "golonganC",
      header: "Golongan C",
      cell: (info) => formatCurrency<SbmUhLuarNegeriPlainObject>(info, "USD"),
    },
    {
      accessorKey: "golonganD",
      header: "Golongan D",
      cell: (info) => formatCurrency<SbmUhLuarNegeriPlainObject>(info, "USD"),
    },
    {
      accessorKey: "tahun",
      header: "Tahun",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "_additionalKolomAksi",
      header: "Aksi",
      cell: (info) =>
        KolomAksi<SbmUhLuarNegeriPlainObject>(
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

  const handleEdit = (row: Row<SbmUhLuarNegeriPlainObject>) => {
    console.log("Edit row:", row);
    // Implement your edit logic here
    setOriginalData(row.original); // Store the original data

    setIsEditing(true);
    setEditableRowIndex(row.id);
  };

  const handleDelete = async (row: SbmUhLuarNegeriPlainObject) => {
    setIsConfirmDialogOpen(true);
    setOriginalData(row);
  };

  const handleCancel = () => {
    setIsConfirmDialogOpen(false);
    console.log("Cancelled!");
  };

  const handleOnSave = async (row: SbmUhLuarNegeriPlainObject) => {
    console.log("Save row:", row);
    // Implement your save logic here
    try {
      const parsed = sbmUhLuarNegeriSchema.parse(row);
      const update = await updateDataSbmUhLuarNegeri(parsed, row.id);
      if (update.success) {
        console.log("Data berhasil disimpan");
        toast.success("Data berhasil disimpan");
        console.log("[updated]", update.data);
      } else {
        console.error("Data gagal disimpan");
        toast.error("Data gagal disimpan");
      }
      setEditableRowIndex(null);
      setIsEditing(false);
      setErrors(null);
    } catch (error) {
      if (error instanceof ZodError) {
        setErrors(error);
      } else {
        console.error("Error saving row:", error);
        toast.error("Error saving row");
      }
    }
  };

  const handleUndoEdit = (row: SbmUhLuarNegeriPlainObject) => {
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

  const handleConfirm = async () => {
    if (!originalData) {
      toast.error("Data tidak ditemukan");
      return;
    }
    const deleted = await deleteDataSbmUhLuarNegeri(originalData.id);
    if (deleted.success) {
      //alert("Data berhasil dihapus");
      toast.success(
        `Data ${originalData.negara.nama} ${originalData.tahun} berhasil dihapus`
      );
      setIsConfirmDialogOpen(false);
      console.log("Data dihapus");
    } else {
      console.log("Data tidak dihapus");
      toast.error(
        `Data  ${originalData.negara.nama} ${originalData.tahun} gagal dihapus ${deleted.message}`
      );
    }
  };

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  return (
    <div>
      {errors && <ZodErrorList error={errors} />}
      <TabelGeneric
        data={filteredData}
        columns={columns}
        frozenColumnCount={frozenColumnCount}
        isEditing={isEditing}
        editableRowId={editableRowId}
      />
      <ConfirmDialog
        message={`Apakah anda yakin menghapus data ${originalData?.negara.nama}  ?`}
        isOpen={isConfirmDialogOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};
