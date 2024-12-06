"use client";
import {
  deleteSbmTransporJakartaKeKotaKabSekitar,
  simpanDataSbmTransporJakartaKeKotaKabSekitar,
} from "@/actions/sbm/transpor";
import ConfirmDialog from "@/components/confirm-dialog";
import {
  formatCurrency,
  KolomAksi,
  TabelGeneric,
} from "@/components/tabel-generic";
import { SbmTransporJakartaKeKotaKabSekitarPlainObject } from "@/data/sbm-transpor/dalam-kota";
import { sbmTransporJakartaKeKotaKabSekitarSchema } from "@/zod/schemas/transpor";

import { ColumnDef, Row } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ZodError } from "zod";

interface TabelSbmTransporJakartaKeKotaSekitarProps {
  data: SbmTransporJakartaKeKotaKabSekitarPlainObject[];
  optionsKota: { value: string; label: string }[];
}
export const TabelSbmTransporJakartaKeKotaSekitar = ({
  data: initialData,
  optionsKota,
}: TabelSbmTransporJakartaKeKotaSekitarProps) => {
  const [data, setData] =
    useState<SbmTransporJakartaKeKotaKabSekitarPlainObject[]>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRowId, setEditableRowIndex] = useState<string | null>(null);
  const [originalData, setOriginalData] =
    useState<SbmTransporJakartaKeKotaKabSekitarPlainObject | null>(null);

  const columns: ColumnDef<SbmTransporJakartaKeKotaKabSekitarPlainObject>[] = [
    {
      id: "rowNumber",
      header: "#",
      // cell: (info) => info.row.index + 1, // Display row number (1-based index)
      footer: "#",
    },
    {
      accessorKey: "kota.nama",
      header: "Kota/Kab",
      cell: (info) => info.getValue(),
      footer: "Kota/Kab",
      meta: {
        inputType: "select",
        options: optionsKota,
        field: "kotaId",
      },
    },
    {
      accessorKey: "besaran",
      header: "Besaran",
      cell: formatCurrency<SbmTransporJakartaKeKotaKabSekitarPlainObject>,
      footer: "Besaran",
    },
    {
      accessorKey: "tahun",
      header: "Tahun",
      cell: (info) => info.getValue(),
      footer: "Tahun",
    },
    {
      accessorKey: "_additionalKolomAksi",
      header: "Aksi",
      cell: (info) =>
        KolomAksi<SbmTransporJakartaKeKotaKabSekitarPlainObject>(
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

  const handleDelete = async (
    row: SbmTransporJakartaKeKotaKabSekitarPlainObject
  ) => {
    setIsConfirmDialogOpen(true);
    setOriginalData(row);
  };

  const handleConfirm = async () => {
    if (!originalData) {
      toast.error("Data tidak ditemukan");
      return;
    }
    const deleted = await deleteSbmTransporJakartaKeKotaKabSekitar(
      originalData.id
    );
    if (deleted.success) {
      //alert("Data berhasil dihapus");
      toast.success(`Data berhasil dihapus`);
      setIsConfirmDialogOpen(false);
      console.log("Data dihapus");
    } else {
      console.log("Data tidak dihapus");
      toast.error(`Data  gagal dihapus `);
    }
  };

  const handleView = (row: SbmTransporJakartaKeKotaKabSekitarPlainObject) => {
    console.log("View row:", row);
    // Implement your view logic here
    // view pdf
  };

  const handleEdit = (
    row: Row<SbmTransporJakartaKeKotaKabSekitarPlainObject>
  ) => {
    console.log("Edit row:", row);
    // Implement your edit logic here
    setOriginalData(row.original); // Store the original data

    setIsEditing(true);
    setEditableRowIndex(row.id);
  };

  const handleOnSave = async (
    row: SbmTransporJakartaKeKotaKabSekitarPlainObject
  ) => {
    console.log("Save row:", row);
    // Implement your save logic here

    try {
      const parsed = sbmTransporJakartaKeKotaKabSekitarSchema.parse(row);
      const update = await simpanDataSbmTransporJakartaKeKotaKabSekitar(parsed);
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

  const handleUndoEdit = (
    row: SbmTransporJakartaKeKotaKabSekitarPlainObject
  ) => {
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
        data={data}
        columns={columns}
        frozenColumnCount={1}
        isEditing={isEditing}
        editableRowId={editableRowId}
        hidePagination={true}
      />
      <ConfirmDialog
        message={`Apakah anda yakin menghapus data ${originalData?.kotaId} ?`}
        isOpen={isConfirmDialogOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default TabelSbmTransporJakartaKeKotaSekitar;
