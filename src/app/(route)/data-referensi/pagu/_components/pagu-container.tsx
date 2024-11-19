"use client";

import { PaguUnitKerja } from "@/actions/pagu";
import { Pagu } from "@prisma-honorarium/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DialogPagu } from "./dialog-tambah-pagu";
import FormPagu from "./form-pagu";
import TabelPagu from "./tabel-pagu";

interface PaguContainerProps {
  data: PaguUnitKerja[] | null;
  optionsUnitKerja: { value: string; label: string }[];
  satkerId?: string;
}
const PaguContainer = ({
  data,
  optionsUnitKerja,
  satkerId,
}: PaguContainerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editableRow, setEditableRow] = useState<Pagu | null>(null);
  const router = useRouter();
  const onEdit = (row: Pagu) => {
    //const { createdAt, updatedAt, ...omittedData } = row;
    setIsOpen(true);
    setEditableRow(row);
    console.log("onEdit form-narasumber-container", row);
  };

  const handleOnClose = () => {
    setIsOpen(false);
    setEditableRow(null);
  };

  const handleFormSubmitComplete = () => {
    setIsOpen(false);
    setEditableRow(null);
    router.refresh();
  };

  return (
    <>
      <DialogPagu open={isOpen} setOpen={setIsOpen}>
        <FormPagu
          onCancel={handleOnClose}
          handleFormSubmitComplete={handleFormSubmitComplete}
          pagu={editableRow}
          satkerId={satkerId}
        />
      </DialogPagu>
      <TabelPagu data={data} optionsPagu={optionsUnitKerja} onEdit={onEdit} />
    </>
  );
};

export default PaguContainer;
