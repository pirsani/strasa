"use client";
import {
  deleteDataSbmUhDalamNegeri,
  updateDataSbmUhDalamNegeri,
} from "@/actions/sbm/uh-dalam-negeri";
import ZodErrorList from "@/approute/data-referensi/_components/zod-error-list";
import ConfirmDialog from "@/components/confirm-dialog";
import {
  formatCurrency,
  KolomAksi,
  TabelGeneric,
} from "@/components/tabel-generic";
import { SbmUhDalamNegeriPlainObject } from "@/data/sbm-uh-dalam-negeri";
import { useSearchTerm } from "@/hooks/use-search-term";
import { sbmUhDalamNegeriSchema } from "@/zod/schemas/sbm-uh-dalam-negeri";
import { ColumnDef, createColumnHelper, Row } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ZodError } from "zod";

const data: SbmUhDalamNegeriPlainObject[] = [];

interface TabelSbmUhDalamNegeriProps {
  data: SbmUhDalamNegeriPlainObject[];
  optionsProvinsi: { value: string; label: string }[];
  frozenColumnCount?: number;
}
export const TabelSbmUhDalamNegeri = ({
  data: initialData,
  optionsProvinsi,
  frozenColumnCount = 2,
}: TabelSbmUhDalamNegeriProps) => {
  const [data, setData] = useState<SbmUhDalamNegeriPlainObject[]>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRowId, setEditableRowIndex] = useState<string | null>(null);
  const [originalData, setOriginalData] =
    useState<SbmUhDalamNegeriPlainObject | null>(null);
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

  const columnHelper = createColumnHelper<SbmUhDalamNegeriPlainObject>();
  const columns: ColumnDef<SbmUhDalamNegeriPlainObject>[] = [
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
      accessorKey: "fullboard",
      header: "Fullboard",
      cell: formatCurrency<SbmUhDalamNegeriPlainObject>,
    },
    {
      accessorKey: "fulldayHalfday",
      header: "Fullday/Halfday",
      cell: formatCurrency<SbmUhDalamNegeriPlainObject>,
    },
    {
      accessorKey: "luarKota",
      header: "Luar Kota",
      cell: formatCurrency<SbmUhDalamNegeriPlainObject>,
    },
    {
      accessorKey: "dalamKota",
      header: "Dalam Kota",
      cell: formatCurrency<SbmUhDalamNegeriPlainObject>,
    },
    {
      accessorKey: "diklat",
      header: "diklat",
      cell: formatCurrency<SbmUhDalamNegeriPlainObject>,
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
        KolomAksi<SbmUhDalamNegeriPlainObject>(
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

  const handleEdit = (row: Row<SbmUhDalamNegeriPlainObject>) => {
    console.log("Edit row:", row);
    // Implement your edit logic here
    setOriginalData(row.original); // Store the original data

    setIsEditing(true);
    setEditableRowIndex(row.id);
  };

  const handleDelete = async (row: SbmUhDalamNegeriPlainObject) => {
    setIsConfirmDialogOpen(true);
    setOriginalData(row);
  };

  const handleConfirm = async () => {
    if (!originalData) {
      toast.error("Data tidak ditemukan");
      return;
    }
    const deleted = await deleteDataSbmUhDalamNegeri(originalData.id);
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

  const handleOnSave = async (row: SbmUhDalamNegeriPlainObject) => {
    console.log("Save row:", row);
    // Implement your save logic here
    try {
      const parsed = sbmUhDalamNegeriSchema.parse(row);
      const update = await updateDataSbmUhDalamNegeri(parsed, row.id);
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

  const handleUndoEdit = (row: SbmUhDalamNegeriPlainObject) => {
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
