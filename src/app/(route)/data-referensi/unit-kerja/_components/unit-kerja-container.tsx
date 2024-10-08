"use client";
import { UnitKerjaWithInduk } from "@/actions/unit-kerja";
import { UnitKerja as ZUnitkerja } from "@/zod/schemas/unit-kerja";
import { useState } from "react";
import { DialogUnitKerja } from "./dialog-tambah-unit-kerja";
import FormUnitKerja from "./form-unit-kerja";
import TabelUnitKerja from "./tabel-unit-kerja";

interface UnitKerjaContainerProps {
  data: UnitKerjaWithInduk[];
  optionsUnitKerja: { value: string; label: string }[];
}
const UnitKerjaContainer = ({
  data,
  optionsUnitKerja,
}: UnitKerjaContainerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editableRow, setEditableRow] = useState<ZUnitkerja | null>(null);

  const onEdit = (row: UnitKerjaWithInduk) => {
    //const { createdAt, updatedAt, ...omittedData } = row;
    setIsOpen(true);
    setEditableRow(row as ZUnitkerja);
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
      <DialogUnitKerja open={isOpen} setOpen={setIsOpen}>
        <FormUnitKerja
          onCancel={handleOnClose}
          handleFormSubmitComplete={handleFormSubmitComplete}
          unitKerja={editableRow}
        />
      </DialogUnitKerja>

      <TabelUnitKerja
        data={data}
        optionsUnitKerja={optionsUnitKerja}
        onEdit={onEdit}
      />
    </>
  );
};

export default UnitKerjaContainer;
