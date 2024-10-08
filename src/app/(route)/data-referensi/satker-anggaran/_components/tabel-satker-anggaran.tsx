"use client";
import {
  deleteSatkerAnggaran,
  satkerAnggaranWithPejabatPengelolaKeuangan,
} from "@/actions/satker-anggaran";
import ConfirmDialog from "@/components/confirm-dialog";
import { KolomAksiDelete, TabelGeneric } from "@/components/tabel-generic";
import { Organisasi as SatkerAnggaran } from "@prisma-honorarium/client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TabelSatkerAnggaranProps {
  data: satkerAnggaranWithPejabatPengelolaKeuangan[];
  optionsEligibleForSatkerAnggaran: { value: string; label: string }[];
}
export const TabelSatkerAnggaran = ({
  data: initialData,
  optionsEligibleForSatkerAnggaran,
}: TabelSatkerAnggaranProps) => {
  const [data, setData] =
    useState<satkerAnggaranWithPejabatPengelolaKeuangan[]>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRowId, setEditableRowIndex] = useState<string | null>(null);
  const [originalData, setOriginalData] =
    useState<satkerAnggaranWithPejabatPengelolaKeuangan | null>(null);
  const columns: ColumnDef<satkerAnggaranWithPejabatPengelolaKeuangan>[] = [
    {
      id: "rowNumber",
      header: "#",
      // cell: (info) => info.row.index + 1, // Display row number (1-based index)
      footer: "#",
      meta: { className: "w-[50px] bg-red-500" },
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
        KolomAksiDelete<satkerAnggaranWithPejabatPengelolaKeuangan>(
          info,
          handleDelete
        ),
      meta: {
        isKolomAksi: true,
        className: "w-[100px]",
      },
      enableSorting: false, // Disable sorting for this column
    },
  ];

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const handleDelete = async (
    row: satkerAnggaranWithPejabatPengelolaKeuangan
  ) => {
    setIsConfirmDialogOpen(true);
    setOriginalData(row);
  };

  const handleConfirm = async () => {
    if (!originalData) {
      toast.error("Data tidak ditemukan");
      return;
    }
    const deleted = await deleteSatkerAnggaran(originalData.id);
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

  const handleView = (row: SatkerAnggaran) => {
    console.log("View row:", row);
    // Implement your view logic here
    // view pdf
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

export default TabelSatkerAnggaran;
