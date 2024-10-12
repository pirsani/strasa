"use client";
import simpanDataSbmTransporDalamKotaPulangPergi, {
  deleteSbmTransporDalamKotaPulangPergi,
} from "@/actions/sbm/transpor";
import ConfirmDialog from "@/components/confirm-dialog";
import {
  formatCurrency,
  KolomAksi,
  TabelGeneric,
} from "@/components/tabel-generic";
import { sbmTransporDalamKotaPulangPergiSchema } from "@/zod/schemas/transpor";

import { SbmTransporDalamKotaPulangPergi } from "@prisma-honorarium/client";
import { ColumnDef, Row } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ZodError } from "zod";

interface TabelSbmTransporDalamKotaPulangPergiProps {
  data: SbmTransporDalamKotaPulangPergi[];
  optionsKota: { value: string; label: string }[];
}
export const TabelSbmTransporDalamKotaPulangPergi = ({
  data: initialData,
  optionsKota,
}: TabelSbmTransporDalamKotaPulangPergiProps) => {
  const [data, setData] =
    useState<SbmTransporDalamKotaPulangPergi[]>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRowId, setEditableRowIndex] = useState<string | null>(null);
  const [originalData, setOriginalData] =
    useState<SbmTransporDalamKotaPulangPergi | null>(null);

  const columns: ColumnDef<SbmTransporDalamKotaPulangPergi>[] = [
    {
      accessorKey: "besaran",
      header: "Besaran",
      cell: formatCurrency<SbmTransporDalamKotaPulangPergi>,
      footer: "Kode",
    },

    {
      accessorKey: "tahun",
      header: "Tahun",
      cell: (info) => info.getValue(),
      footer: "Tahun",
      meta: {
        className: "align-right",
      },
    },
    {
      accessorKey: "_additionalKolomAksi",
      header: "Aksi",
      cell: (info) =>
        KolomAksi<SbmTransporDalamKotaPulangPergi>(
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

  const handleDelete = async (row: SbmTransporDalamKotaPulangPergi) => {
    setIsConfirmDialogOpen(true);
    setOriginalData(row);
  };

  const handleConfirm = async () => {
    if (!originalData) {
      toast.error("Data tidak ditemukan");
      return;
    }
    const deleted = await deleteSbmTransporDalamKotaPulangPergi(
      originalData.id
    );
    if (deleted.success) {
      //alert("Data berhasil dihapus");
      toast.success(`Data ${originalData.tahun} berhasil dihapus`);
      setIsConfirmDialogOpen(false);
      console.log("Data dihapus");
    } else {
      console.log("Data tidak dihapus");
      toast.error(
        `Data ${originalData.tahun} gagal dihapus ${deleted.message}`
      );
    }
  };

  const handleView = (row: SbmTransporDalamKotaPulangPergi) => {
    console.log("View row:", row);
    // Implement your view logic here
    // view pdf
  };

  const handleEdit = (row: Row<SbmTransporDalamKotaPulangPergi>) => {
    console.log("Edit row:", row);
    // Implement your edit logic here
    setOriginalData(row.original); // Store the original data

    setIsEditing(true);
    setEditableRowIndex(row.id);
  };

  const handleOnSave = async (row: SbmTransporDalamKotaPulangPergi) => {
    console.log("Save row:", row);
    // Implement your save logic here

    try {
      const parsed = sbmTransporDalamKotaPulangPergiSchema.parse(row);
      const update = await simpanDataSbmTransporDalamKotaPulangPergi(parsed);
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

  const handleUndoEdit = (row: SbmTransporDalamKotaPulangPergi) => {
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
        message={`Apakah anda yakin menghapus data tahun ${originalData?.tahun} ?`}
        isOpen={isConfirmDialogOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default TabelSbmTransporDalamKotaPulangPergi;
