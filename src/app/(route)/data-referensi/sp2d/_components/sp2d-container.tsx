"use client";

import { Sp2dUnitKerja } from "@/actions/sp2d";
import { Sp2d } from "@prisma-honorarium/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DialogSp2d } from "./dialog-tambah-sp2d";
import FormSp2d from "./form-sp2d";
import TabelSp2d from "./tabel-sp2d";

interface Sp2dContainerProps {
  data: Sp2dUnitKerja[] | null;
  optionsUnitKerja: { value: string; label: string }[];
  satkerId?: string;
}
const Sp2dContainer = ({
  data,
  optionsUnitKerja,
  satkerId,
}: Sp2dContainerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editableRow, setEditableRow] = useState<Sp2d | null>(null);
  const router = useRouter();
  const onEdit = (row: Sp2d) => {
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
      <DialogSp2d open={isOpen} setOpen={setIsOpen}>
        <FormSp2d
          onCancel={handleOnClose}
          handleFormSubmitComplete={handleFormSubmitComplete}
          sp2d={editableRow}
          satkerId={satkerId}
        />
      </DialogSp2d>
      <TabelSp2d data={data} optionsSp2d={optionsUnitKerja} onEdit={onEdit} />
    </>
  );
};

export default Sp2dContainer;
