"use client";
import {
  deleteDataSbmUangRepresentasi,
  sbmUangRepresentasiWithPejabat,
  updateDataSbmUangRepresentasi,
} from "@/actions/sbm/uang-representasi";
import ZodErrorList from "@/approute/data-referensi/_components/zod-error-list";
import ConfirmDialog from "@/components/confirm-dialog";
import {
  formatCurrency,
  KolomAksi,
  TabelGeneric,
} from "@/components/tabel-generic";
import { sbmUangRepresentasiSchema } from "@/zod/schemas/sbm-uang-representasi";
import { SbmUangRepresentasi } from "@prisma-honorarium/client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ZodError } from "zod";

interface TabelSbmUangRepresentasiProps {
  data: sbmUangRepresentasiWithPejabat[];
  optionsPejabat: { value: number; label: string }[];
}
export const TabelSbmUangRepresentasi = ({
  data: initialData,
  optionsPejabat,
}: TabelSbmUangRepresentasiProps) => {
  const [data, setData] =
    useState<sbmUangRepresentasiWithPejabat[]>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRowId, setEditableRowIndex] = useState<string | null>(null);
  const [originalData, setOriginalData] =
    useState<sbmUangRepresentasiWithPejabat | null>(null);
  const [errors, setErrors] = useState<ZodError | null>(null);

  const columns: ColumnDef<sbmUangRepresentasiWithPejabat>[] = [
    {
      id: "rowNumber",
      header: "#",
      // cell: (info) => info.row.index + 1, // Display row number (1-based index)
      footer: "#",
    },
    {
      accessorKey: "pejabat.nama",
      header: "Pejabat",
      cell: (info) => info.getValue(),
      footer: "Pejabat",
      meta: {
        inputType: "select",
        options: optionsPejabat,
        field: "kegiatanId",
        isCellEditable: false,
      },
    },
    {
      accessorKey: "satuan",
      header: "Satuan",
      cell: (info) => info.getValue(),
      footer: "Satuan",
    },
    {
      accessorKey: "luarKota",
      header: "Luar Kota",
      cell: formatCurrency<sbmUangRepresentasiWithPejabat>,
      footer: "luar Kota",
    },
    {
      accessorKey: "dalamKota",
      header: "Dalam Kota lebih dari 8 Jam",
      cell: formatCurrency<sbmUangRepresentasiWithPejabat>,
      footer: "Dalam Kota",
    },
    {
      accessorKey: "tahun",
      header: "Tahun",
      cell: (info) => info.getValue(),
      footer: "Dalam Kota",
    },
    {
      accessorKey: "_additionalKolomAksi",
      header: "Aksi",
      cell: (info) =>
        KolomAksi<sbmUangRepresentasiWithPejabat>(
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

  const handleDelete = async (row: sbmUangRepresentasiWithPejabat) => {
    setIsConfirmDialogOpen(true);
    setOriginalData(row);
  };

  const handleConfirm = async () => {
    if (!originalData) {
      toast.error("Data tidak ditemukan");
      return;
    }
    const deleted = await deleteDataSbmUangRepresentasi(originalData.id);
    if (deleted.success) {
      //alert("Data berhasil dihapus");
      toast.success(
        `Data ${originalData.pejabat.nama} ${originalData.tahun} berhasil dihapus`
      );
      setIsConfirmDialogOpen(false);
      console.log("Data dihapus");
    } else {
      console.log("Data tidak dihapus");
      toast.error(
        `Data  ${originalData.pejabat.nama} ${originalData.tahun} gagal dihapus ${deleted.message}`
      );
    }
  };

  const handleView = (row: SbmUangRepresentasi) => {
    console.log("View row:", row);
    // Implement your view logic here
    // view pdf
  };

  const handleEdit = (row: Row<sbmUangRepresentasiWithPejabat>) => {
    console.log("Edit row:", row);
    // Implement your edit logic here
    setOriginalData(row.original); // Store the original data

    setIsEditing(true);
    setEditableRowIndex(row.id);
  };

  const handleOnSave = async (row: sbmUangRepresentasiWithPejabat) => {
    console.log("Save row:", row);
    // Implement your save logic here

    try {
      const parsed = sbmUangRepresentasiSchema.parse(row);
      const update = await updateDataSbmUangRepresentasi(parsed, row.id);
      if (update.success) {
        console.log("Data berhasil disimpan");
        toast.success("Data berhasil disimpan");
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
      console.error("Error saving row:", error);
    }
  };

  const handleUndoEdit = (row: sbmUangRepresentasiWithPejabat) => {
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
        data={data}
        columns={columns}
        frozenColumnCount={1}
        isEditing={isEditing}
        editableRowId={editableRowId}
      />
      <ConfirmDialog
        message={`Apakah anda yakin menghapus data ${originalData?.pejabat.nama} ?`}
        isOpen={isConfirmDialogOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default TabelSbmUangRepresentasi;
