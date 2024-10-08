"use client";
import { PejabatPerbendaharaanWithStringDate } from "@/data/pejabat-perbendaharaan";
import { PejabatPerbendaharaan as ZPejabatPerbendaharaan } from "@/zod/schemas/pejabat-perbendaharaan";
import { useState } from "react";
import { DialogFormPejabatPerbendaharaan } from "./dialog-form-pejabat-perbendaharaan";
import FormPejabatPerbendaharaan from "./form-pejabat-perbendaharaan";
import { TabelPejabatPerbendaharaan } from "./tabel-pejabat-perbendaharaan";

interface PejabatPerbendaharaanContainerProps {
  data: PejabatPerbendaharaanWithStringDate[];
}
const PejabatPerbendaharaanContainer = ({
  data,
}: PejabatPerbendaharaanContainerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editableRow, setEditableRow] = useState<ZPejabatPerbendaharaan | null>(
    null
  );

  const onEdit = (row: PejabatPerbendaharaanWithStringDate) => {
    //const { createdAt, updatedAt, ...omittedData } = row;
    setIsOpen(true);
    setEditableRow(row as ZPejabatPerbendaharaan);
    console.log("onEdit form-narasumber-container", row);
  };

  const handleOnClose = () => {
    setIsOpen(false);
    setEditableRow(null);
  };

  const handleFormSubmitComplete = () => {
    setIsOpen(false);
    setEditableRow(null);
  };

  return (
    <>
      <DialogFormPejabatPerbendaharaan open={isOpen} setOpen={setIsOpen}>
        <FormPejabatPerbendaharaan
          onCancel={handleOnClose}
          handleFormSubmitComplete={handleFormSubmitComplete}
          pejabat={editableRow}
        />
      </DialogFormPejabatPerbendaharaan>

      <TabelPejabatPerbendaharaan data={data} onEdit={onEdit} />
    </>
  );
};

export default PejabatPerbendaharaanContainer;
