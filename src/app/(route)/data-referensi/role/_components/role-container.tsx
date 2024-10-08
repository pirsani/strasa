"use client";
import { RoleWithPermissions } from "@/actions/role";
import { Role as ZRole } from "@/zod/schemas/role";
import { useState } from "react";
import { DialogFormRole } from "./dialog-form-role";
import FormRole from "./form-role";
import TabelRole from "./tabel-role";

interface RoleContainerProps {
  data: RoleWithPermissions[];
}
const RoleContainer = ({ data }: RoleContainerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editableRow, setEditableRow] = useState<ZRole | null>(null);

  const onEdit = (row: RoleWithPermissions) => {
    //const { createdAt, updatedAt, ...omittedData } = row;
    //console.log("onEdit form-role-container", row);

    // transform permissions to array of string
    const permissions = row.rolePermission.map((p) => p.permissionId);
    const role: ZRole = {
      ...row,
      permissions: permissions,
    };

    setIsOpen(true);
    setEditableRow(role);
    //console.log("onEdit form-narasumber-container", row);
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
      <DialogFormRole open={isOpen} setOpen={setIsOpen}>
        <FormRole
          onCancel={handleOnClose}
          handleFormSubmitComplete={handleFormSubmitComplete}
          role={editableRow}
        />
      </DialogFormRole>

      <TabelRole data={data} onEdit={onEdit} />
    </>
  );
};

export default RoleContainer;
