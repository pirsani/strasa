"use client";
import { hapusDataPagu, PaguUnitKerja, simpanDataPagu } from "@/actions/pagu";
import ConfirmDialog from "@/components/confirm-dialog";
import {
  formatCurrency,
  KolomAksi,
  TabelGeneric,
} from "@/components/tabel-generic";
import { useSearchTerm } from "@/hooks/use-search-term";
import { paguSchema } from "@/zod/schemas/pagu";
import { Organisasi as Pagu } from "@prisma-honorarium/client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ZodError } from "zod";

interface TabelPaguProps {
  data: PaguUnitKerja[] | null;
  optionsPagu: { value: string; label: string }[];
  onEdit: (row: PaguUnitKerja) => void;
}
export const TabelPagu = ({
  data: initialData,
  optionsPagu,
  onEdit = () => {},
}: TabelPaguProps) => {
  const [data, setData] = useState<PaguUnitKerja[] | null>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRowId, setEditableRowIndex] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState<PaguUnitKerja | null>(null);
  const router = useRouter();

  const { searchTerm } = useSearchTerm();

  const filteredData = (data ?? []).filter((row) => {
    if (!searchTerm || searchTerm === "") return true;
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    //const searchWords = lowercasedSearchTerm.split(" ").filter(Boolean);
    const searchWords =
      lowercasedSearchTerm
        .match(/"[^"]+"|\S+/g)
        ?.map((word) => word.replace(/"/g, "")) || [];

    return searchWords.every(
      (word) =>
        row.unitKerja.nama?.toLowerCase().includes(word) ||
        row.unitKerja.singkatan?.toLowerCase().includes(word) ||
        row.unitKerja.indukOrganisasi?.nama?.toLowerCase().includes(word)
    );
  });

  const columns: ColumnDef<PaguUnitKerja>[] = [
    {
      id: "rowNumber",
      header: "#",
      // cell: (info) => info.row.index + 1, // Display row number (1-based index)
      footer: "#",
    },

    {
      accessorKey: "unitKerja.singkatan",
      header: "Unit",
      cell: (info) => info.getValue(),
      footer: "Unit",
    },

    {
      accessorKey: "unitKerja.indukOrganisasi.nama",
      header: "Induk Organisasi",
      cell: (info) => info.getValue(),
      footer: "Singkatan",
    },
    {
      accessorKey: "pagu",
      header: "Pagu",
      cell: formatCurrency<PaguUnitKerja>,
      footer: "Singkatan",
    },
    {
      accessorKey: "_additionalKolomAksi",
      header: "Aksi",
      cell: (info) =>
        KolomAksi<PaguUnitKerja>(
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

  const handleDelete = async (row: PaguUnitKerja) => {
    setIsConfirmDialogOpen(true);
    setOriginalData(row);
  };

  const handleConfirm = async () => {
    if (!originalData) {
      toast.error("Data tidak ditemukan");
      return;
    }
    const deleted = await hapusDataPagu(originalData.id);
    if (deleted.success) {
      //alert("Data berhasil dihapus");
      toast.success(
        `Data pagu ${originalData.unitKerja.nama} berhasil dihapus`
      );
      setIsConfirmDialogOpen(false);
      console.log("Data dihapus");
      router.refresh();
    } else {
      console.log("Data tidak dihapus");
      toast.error(
        `Data pagu ${originalData.unitKerja.nama} gagal dihapus ${deleted.message}`
      );
    }
  };

  const handleView = (row: Pagu) => {
    console.log("View row:", row);
    // Implement your view logic here
    // view pdf
  };

  const handleEdit = (row: Row<PaguUnitKerja>) => {
    console.log("Edit row:", row);
    // Implement your edit logic here
    setOriginalData(row.original); // Store the original data

    onEdit(row.original);
    // setIsEditing(true);
    // setEditableRowIndex(row.id);
  };

  const handleOnSave = async (row: PaguUnitKerja) => {
    console.log("Save row:", row);
    // Implement your save logic here
    //convert back kegiatanId as number
    //row.kegiatanId = Number(row.kegiatanId);

    try {
      const parsed = paguSchema.parse(row);
      const update = await simpanDataPagu(parsed);
      if (update.success) {
        console.log(update.data);
        toast.success("Data berhasil disimpan");
      } else {
        console.log("Data gagal disimpan");
        toast.error("Data gagal disimpan");
      }
      setEditableRowIndex(null);
      setIsEditing(false);
    } catch (error) {
      if (error instanceof ZodError) {
        //setErrors(error);
        toast.error("Data gagal disimpan");
      } else {
        console.log("Error saving row:", error);
      }
      console.log("Error saving row:", error);
    }
  };

  const handleUndoEdit = (row: PaguUnitKerja) => {
    console.log("Undo edit row:", row);
    // Implement your undo edit logic here
    if (originalData) {
      setData((prevData) =>
        (prevData ?? []).map((item) =>
          item.id === row.id ? originalData : item
        )
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
        message={`Apakah anda yakin menghapus data ${originalData?.unitKerja.nama} ?`}
        isOpen={isConfirmDialogOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default TabelPagu;
