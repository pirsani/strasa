"use client";
import TambahNarasumber from "@/approute/data-referensi/narasumber/_components/tambah-narasumber";
import { NarasumberWithStringDate } from "@/data/narasumber";
import { NarasumberForEditing } from "@/zod/schemas/narasumber";
import { useState } from "react";
import EditNarasumber from "./edit-narasumber";
import { TabelNarasumber } from "./tabel-narasumber";

interface FormNarasumberContainerProps {
  data: NarasumberWithStringDate[];
}

const FormNarasumberContainer = ({
  data: narasumber,
}: FormNarasumberContainerProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableRow, setEditableRow] = useState<NarasumberForEditing | null>(
    null
  );

  const onEdit = (row: NarasumberWithStringDate) => {
    const {
      createdAt,
      updatedAt,
      dokumenPeryataanRekeningBerbeda,
      ...omittedData
    } = row;
    setIsEditing(true);
    setEditableRow(omittedData);
    console.log("onEdit form-narasumber-container", row);
  };

  const handleOnClose = () => {
    setIsEditing(false);
    setEditableRow(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <TambahNarasumber />
      <EditNarasumber
        isEditing={isEditing}
        closeDialog={handleOnClose}
        narasumber={editableRow}
      />
      <TabelNarasumber data={narasumber} onEdit={onEdit} />
    </div>
  );
};

export default FormNarasumberContainer;
