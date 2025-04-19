"use client";
import { deletePeserta } from "@/actions/peserta";
import ConfirmDialog from "@/components/confirm-dialog";
import FloatingComponent from "@/components/floating-component";
import PdfPreviewContainer from "@/components/pdf-preview-container";
import {
  KolomAksi,
  TabelGenericWithoutInlineEdit,
} from "@/components/tabel-generic-without-inline-edit";
import { PesertaWithStringDate } from "@/data/peserta";
import useFileStore from "@/hooks/use-file-store";
import { useSearchTerm } from "@/hooks/use-search-term";
import { Peserta } from "@prisma-honorarium/client";
import { ColumnDef, createColumnHelper, Row } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ZodError } from "zod";

const data: Peserta[] | PesertaWithStringDate = [];

const columnHelper = createColumnHelper<PesertaWithStringDate>();

interface TabelPesertaProps {
  data: PesertaWithStringDate[];
  onEdit: (row: PesertaWithStringDate) => void;
}
export const TabelPeserta = ({
  data: initialData,
  onEdit = () => {},
}: TabelPesertaProps) => {
  const [data, setData] = useState<PesertaWithStringDate[]>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRowId, setEditableRowIndex] = useState<string | null>(null);
  const [originalData, setOriginalData] =
    useState<PesertaWithStringDate | null>(null);
  const [errors, setErrors] = useState<ZodError | null>(null);
  const { searchTerm } = useSearchTerm();

  const { fileUrl, isPreviewHidden, setFileUrl } = useFileStore();

  const handleOnHide = () => {
    useFileStore.setState({ isPreviewHidden: true });
  };

  const handleOnShow = () => {
    useFileStore.setState({ isPreviewHidden: false });
  };

  useEffect(() => {
    useFileStore.setState({ isPreviewHidden: true });
  }, []);

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
        row.NIP?.toLowerCase().includes(word) ||
        row.nama?.toLowerCase().includes(word) ||
        row.id?.toLowerCase().includes(word) ||
        row.jabatan?.toLowerCase().includes(word) ||
        row.jabatan?.toString().toLowerCase().includes(word) ||
        row.pangkatGolonganId?.toLowerCase().includes(word) ||
        row.bank?.toLowerCase().includes(word)
    );
  });

  const columns: ColumnDef<PesertaWithStringDate>[] = [
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
      meta: { className: "w-[400px]" }, // have no effect on big table
    },
    {
      accessorKey: "id",
      header: "NIK",
      cell: (info) => info.getValue(),
      meta: { rowSpan: 2 },
    },
    {
      accessorKey: "NIP",
      header: "NIP",
      cell: (info) => info.getValue(),
      meta: { rowSpan: 2 },
    },
    {
      accessorKey: "jabatan",
      header: "jabatan",
      cell: (info) => info.getValue(),
      meta: { rowSpan: 2 },
    },
    {
      accessorKey: "eselon",
      header: "Eselon",
      cell: (info) => info.getValue(),
      meta: { rowSpan: 2 },
    },
    {
      accessorKey: "pangkatGolonganId",
      header: "Golongan/Ruang",
      cell: (info) => info.getValue(),
      meta: { rowSpan: 2 },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: (info) => info.getValue(),
      meta: { rowSpan: 2 },
    },
    columnHelper.group({
      id: "bank",
      header: () => "Bank",
      columns: [
        columnHelper.accessor("bank", {
          cell: (info) => info.getValue(),
          header: "Bank",
        }),
        columnHelper.accessor((row) => row.namaRekening, {
          id: "namaRekening",
          cell: (info) => info.getValue(),
          header: "Nama Rekening",
        }),
        columnHelper.accessor((row) => row.nomorRekening, {
          id: "nomorRekening",
          cell: (info) => info.getValue(),
          header: "Nomor Rekening",
        }),
      ],
    }),
    {
      accessorKey: "_additionalKolomAksi",
      header: "Aksi",
      cell: (info) =>
        KolomAksi<PesertaWithStringDate>(
          info,
          handleEdit,
          handleDelete,
          handleView,
          isEditing
        ),
      meta: { isKolomAksi: true },
      enableSorting: false, // Disable sorting for this column
    },
  ];

  const handleEdit = (row: Row<PesertaWithStringDate>) => {
    console.log("Edit row:", row);
    // Implement your edit logic here
    setOriginalData(row.original); // Store the original data
    //alert("I will be edited");
    onEdit(row.original);
    //console.log("onEdit tabel-peserta", row.original);
    // setIsEditing(true);
    // setEditableRowIndex(row.id);
  };

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const handleDelete = async (row: PesertaWithStringDate) => {
    setIsConfirmDialogOpen(true);
    setOriginalData(row);
  };

  const handleConfirm = async () => {
    if (!originalData) {
      toast.error("Data tidak ditemukan");
      return;
    }
    const deleted = await deletePeserta(originalData.id);
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

  const handleView = (row: PesertaWithStringDate) => {
    console.log("View row:", row);
    if (!row.dokumenPeryataanRekeningBerbeda) {
      toast.error("tidak ada dokumen pernyataan rekening berbeda");
      return;
    }
    // generate file url
    const fileUrl = "/download/" + row.dokumenPeryataanRekeningBerbeda;
    setFileUrl(fileUrl);

    handleOnShow();
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
      <TabelGenericWithoutInlineEdit
        data={filteredData}
        columns={columns}
        frozenColumnCount={2}
        isEditing={isEditing}
        editableRowId={editableRowId}
      />
      <ConfirmDialog
        message={`Apakah anda yakin menghapus data ${originalData?.nama} ?`}
        isOpen={isConfirmDialogOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <FloatingComponent hide={isPreviewHidden} onHide={handleOnHide}>
        <PdfPreviewContainer className="border-2 h-full border-gray-500" />
      </FloatingComponent>
    </div>
  );
};
