"use client";
import { deleteRole, RoleWithPermissions } from "@/actions/role";
import ConfirmDialog from "@/components/confirm-dialog";
import {
  KolomPilihanAksi,
  TabelGenericWithoutInlineEdit,
} from "@/components/tabel-generic-without-inline-edit";
import { useSearchTerm } from "@/hooks/use-search-term";
import { Organisasi as Role } from "@prisma-honorarium/client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TabelRoleProps {
  data: RoleWithPermissions[];
  onEdit: (row: RoleWithPermissions) => void;
}
export const TabelRole = ({
  data: initialData,
  onEdit = () => {},
}: TabelRoleProps) => {
  const [data, setData] = useState<RoleWithPermissions[]>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRowId, setEditableRowIndex] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState<RoleWithPermissions | null>(
    null
  );

  const { searchTerm } = useSearchTerm();

  const filteredData = data.filter((row) => {
    if (!searchTerm || searchTerm === "") return true;
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    //const searchWords = lowercasedSearchTerm.split(" ").filter(Boolean);
    const searchWords =
      lowercasedSearchTerm
        .match(/"[^"]+"|\S+/g)
        ?.map((word) => word.replace(/"/g, "")) || [];

    return searchWords.every((word) => row.name?.toLowerCase().includes(word));
  });

  const columns: ColumnDef<RoleWithPermissions>[] = [
    {
      id: "rowNumber",
      header: "#",
      // cell: (info) => info.row.index + 1, // Display row number (1-based index)
      footer: "#",
      meta: { className: "w-[50px]" },
    },
    {
      accessorKey: "name",
      header: "Nama",
      cell: (info) => info.getValue(),
      footer: "Nama",
    },
    {
      accessorKey: "_additionalKolomAksi",
      header: "Aksi",
      cell: (info) =>
        KolomPilihanAksi<RoleWithPermissions>(
          info,
          ["delete", "edit"],
          isEditing,
          handleEdit,
          handleDelete
        ),
      meta: { isKolomAksi: true, className: "w-[100px]" },
      enableSorting: false, // Disable sorting for this column
    },
  ];

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const handleDelete = async (row: RoleWithPermissions) => {
    setIsConfirmDialogOpen(true);
    setOriginalData(row);
  };

  const handleConfirm = async () => {
    if (!originalData) {
      toast.error("Data tidak ditemukan");
      return;
    }
    const deleted = await deleteRole(originalData.id);
    if (deleted.success) {
      //alert("Data berhasil dihapus");
      toast.success(`Data ${originalData.name} berhasil dihapus`);
      setIsConfirmDialogOpen(false);
      console.log("Data dihapus");
    } else {
      console.log("Data tidak dihapus");
      toast.error(`Data ${originalData.name} gagal dihapus ${deleted.message}`);
    }
  };

  const handleView = (row: Role) => {
    //console.log("View row:", row);
    // Implement your view logic here
    // view pdf
  };

  const handleEdit = (row: Row<RoleWithPermissions>) => {
    //console.log("Edit row:", row);
    // Implement your edit logic here
    setOriginalData(row.original); // Store the original data

    onEdit(row.original);
    // setIsEditing(true);
    // setEditableRowIndex(row.id);
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
        frozenColumnCount={1}
        isEditing={isEditing}
        editableRowId={editableRowId}
      />
      <ConfirmDialog
        message={`Apakah anda yakin menghapus data ${originalData?.name} ?`}
        isOpen={isConfirmDialogOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default TabelRole;
