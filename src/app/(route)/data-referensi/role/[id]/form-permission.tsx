"use client";
import FormRole from "../_components/form-role";
import { GridPemission } from "./grid-permission";

interface FormPermissionsProps {
  resources: string[];
  permissions?: string[];
}

const actions = [
  "create:any",
  "create:own",
  "read:any",
  "read:own",
  "update:any",
  "update:own",
  "delete:own",
  "delete:any",
];

const FormPermissions = ({ resources, permissions }: FormPermissionsProps) => {
  return (
    <div className="w-full h-[100px] max-w-screen-md border verflow-y-auto">
      <div className="flex items-center justify-between p-2">
        <FormRole
          resources={resources}
          actions={actions}
          permissions={permissions}
        />
      </div>
      <div className="h-full overflow-y-auto flex flex-col gap-2">
        <GridPemission
          resources={resources}
          actions={actions}
          permissions={permissions}
        />
      </div>
    </div>
  );
};

export default FormPermissions;
