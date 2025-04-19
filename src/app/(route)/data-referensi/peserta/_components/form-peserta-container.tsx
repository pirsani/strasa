"use client";
import DialogTambahPeserta from "@/app/(route)/data-referensi/peserta/_components/dialog-tambah-peserta";
import { PesertaWithStringDate } from "@/data/peserta";
import { PesertaForEditing } from "@/zod/schemas/peserta";
import { useState } from "react";
import EditPeserta from "./edit-peserta";
import { TabelPeserta } from "./tabel-peserta";

interface FormPesertaContainerProps {
  data: PesertaWithStringDate[];
}

const FormPesertaContainer = ({ data: peserta }: FormPesertaContainerProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableRow, setEditableRow] = useState<PesertaForEditing | null>(
    null
  );

  const onEdit = (row: PesertaWithStringDate) => {
    const {
      createdAt,
      updatedAt,
      dokumenPeryataanRekeningBerbeda,
      ...omittedData
    } = row;
    setIsEditing(true);
    setEditableRow({
      ...omittedData,
      NIP: row.NIP || "-",
      NPWP: row.NPWP || "-",
      jabatan: row.jabatan || "-",
      eselon: row.eselon ? parseInt(row.eselon) : null,
    });
    console.log("onEdit form-peserta-container", row);
  };

  const handleOnClose = () => {
    setIsEditing(false);
    setEditableRow(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <DialogTambahPeserta />
      <EditPeserta
        isEditing={isEditing}
        closeDialog={handleOnClose}
        peserta={editableRow}
      />
      <TabelPeserta data={peserta} onEdit={onEdit} />
    </div>
  );
};

export default FormPesertaContainer;
