"use client";
import {
  deleteDataSbmHonorarium,
  updateDataSbmHonorarium,
} from "@/actions/sbm/honorarium";
import ZodErrorList from "@/approute/data-referensi/_components/zod-error-list";
import ConfirmDialog from "@/components/confirm-dialog";
import {
  formatCurrency,
  KolomAksi,
  TabelGeneric,
} from "@/components/tabel-generic";
import { SbmHonorariumPlainObject } from "@/data/sbm-honorarium";
import { useSearchTerm } from "@/hooks/use-search-term";
import { sbmHonorariumSchema } from "@/zod/schemas/sbm-honorarium";
import { ColumnDef, createColumnHelper, Row } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ZodError } from "zod";

const data: SbmHonorariumPlainObject[] = [];

interface TabelSbmHonorariumProps {
  data: SbmHonorariumPlainObject[];
}
export const TabelSbmHonorarium = ({
  data: initialData,
}: TabelSbmHonorariumProps) => {
  const [data, setData] = useState<SbmHonorariumPlainObject[]>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRowId, setEditableRowIndex] = useState<string | null>(null);
  const [originalData, setOriginalData] =
    useState<SbmHonorariumPlainObject | null>(null);
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
        row.jenis.toLowerCase().includes(word) ||
        row.uraian?.toLowerCase().includes(word)
    );
  });

  const columnHelper = createColumnHelper<SbmHonorariumPlainObject>();

  const columns: ColumnDef<SbmHonorariumPlainObject>[] = [
    {
      id: "rowNumber",
      header: "#",
      // cell: (info) => info.row.index + 1, // Display row number (1-based index)
      footer: "#",
    },
    {
      accessorKey: "jenis",
      header: "Jenis",
      cell: (info) => info.getValue(),
      footer: "Jenis",
    },
    {
      accessorKey: "satuan",
      header: "Satuan",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "besaran",
      header: "Besaran",
      cell: formatCurrency<SbmHonorariumPlainObject>,
    },
    {
      accessorKey: "uraian",
      header: "Uraian",
      cell: (info) => info.getValue(),
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
        KolomAksi<SbmHonorariumPlainObject>(
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

  const handleDelete = async (row: SbmHonorariumPlainObject) => {
    setIsConfirmDialogOpen(true);
    setOriginalData(row);
  };

  const handleConfirm = async () => {
    if (!originalData) {
      toast.error("Data tidak ditemukan");
      return;
    }
    const deleted = await deleteDataSbmHonorarium(originalData.id);
    if (deleted.success) {
      //alert("Data berhasil dihapus");
      toast.success(
        `Data ${originalData.jenis} ${originalData.uraian} berhasil dihapus`
      );
      setIsConfirmDialogOpen(false);
      console.log("Data dihapus");
    } else {
      console.log("Data tidak dihapus");
      toast.error(
        `Data  ${originalData.jenis} ${originalData.uraian} gagal dihapus ${deleted.message}`
      );
    }
  };

  const handleEdit = (row: Row<SbmHonorariumPlainObject>) => {
    console.log("Edit row:", row);
    // Implement your edit logic here
    setOriginalData(row.original); // Store the original data

    setIsEditing(true);
    setEditableRowIndex(row.id);
  };

  const handleOnSave = async (row: SbmHonorariumPlainObject) => {
    console.log("Save row:", row);
    // Implement your save logic here
    try {
      const parsed = sbmHonorariumSchema.parse(row);
      const update = await updateDataSbmHonorarium(parsed, row.id);
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

  const handleUndoEdit = (row: SbmHonorariumPlainObject) => {
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
      {errors && <ZodErrorList error={errors} />}
      <TabelGeneric
        data={filteredData}
        columns={columns}
        frozenColumnCount={1}
        isEditing={isEditing}
        editableRowId={editableRowId}
      />
      <ConfirmDialog
        message={`Apakah anda yakin menghapus data ${originalData?.jenis} ${originalData?.uraian} ?`}
        isOpen={isConfirmDialogOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};
