"use client";
import { deleteDataSbmTaksi, updateDataSbmTaksi } from "@/actions/sbm/taksi";
import ZodErrorList from "@/approute/data-referensi/_components/zod-error-list";
import ConfirmDialog from "@/components/confirm-dialog";
import {
  formatCurrency,
  KolomAksi,
  TabelGeneric,
} from "@/components/tabel-generic";
import { SbmTaksiPlainObject } from "@/data/sbm-taksi";
import { useSearchTerm } from "@/hooks/use-search-term";
import { sbmTaksiSchema } from "@/zod/schemas/sbm-taksi";
import { ColumnDef, createColumnHelper, Row } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ZodError } from "zod";

const data: SbmTaksiPlainObject[] = [];

interface TabelSbmTaksiProps {
  data: SbmTaksiPlainObject[];
  optionsProvinsi: { value: string; label: string }[];
  frozenColumnCount?: number;
}
export const TabelSbmTaksi = ({
  data: initialData,
  optionsProvinsi,
  frozenColumnCount = 2,
}: TabelSbmTaksiProps) => {
  const [data, setData] = useState<SbmTaksiPlainObject[]>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRowId, setEditableRowIndex] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState<SbmTaksiPlainObject | null>(
    null
  );
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

    return searchWords.every((word) =>
      row.provinsi.nama.toLowerCase().includes(word)
    );
  });

  const columnHelper = createColumnHelper<SbmTaksiPlainObject>();
  const columns: ColumnDef<SbmTaksiPlainObject>[] = [
    {
      id: "rowNumber",
      header: "#",
      // cell: (info) => info.row.index + 1, // Display row number (1-based index)
      footer: "#",
    },
    {
      accessorKey: "provinsi.nama",
      header: "Provinsi",
      cell: (info) => info.getValue(),
      footer: "Provinsi",
      meta: {
        // inputType: "select",
        // options: optionsProvinsi,
        // field: "provinsiId",
        isCellEditable: false,
      },
    },
    {
      accessorKey: "satuan",
      header: "Satuan",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "besaran",
      header: "Besaran",
      cell: formatCurrency<SbmTaksiPlainObject>,
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
        KolomAksi<SbmTaksiPlainObject>(
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

  const handleEdit = (row: Row<SbmTaksiPlainObject>) => {
    console.log("Edit row:", row);
    // Implement your edit logic here
    setOriginalData(row.original); // Store the original data

    setIsEditing(true);
    setEditableRowIndex(row.id);
  };

  const handleDelete = async (row: SbmTaksiPlainObject) => {
    setIsConfirmDialogOpen(true);
    setOriginalData(row);
  };

  const handleConfirm = async () => {
    if (!originalData) {
      toast.error("Data tidak ditemukan");
      return;
    }
    const deleted = await deleteDataSbmTaksi(originalData.id);
    if (deleted.success) {
      //alert("Data berhasil dihapus");
      toast.success(`Data sbm ${originalData.provinsi.nama}  berhasil dihapus`);
      setIsConfirmDialogOpen(false);
      console.log("Data dihapus");
    } else {
      console.log("Data tidak dihapus");
      toast.error(
        `Data  ${originalData.provinsi.nama} } gagal dihapus ${deleted.message}`
      );
    }
  };

  const handleCancel = () => {
    setIsConfirmDialogOpen(false);
    console.log("Cancelled!");
  };

  const handleOnSave = async (row: SbmTaksiPlainObject) => {
    console.log("Save row:", row);
    // Implement your save logic here
    try {
      const parsed = sbmTaksiSchema.parse(row);
      const update = await updateDataSbmTaksi(parsed, row.id);
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

  const handleUndoEdit = (row: SbmTaksiPlainObject) => {
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
        message={`Apakah anda yakin menghapus data ${originalData?.provinsi.nama}  ?`}
        isOpen={isConfirmDialogOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};
