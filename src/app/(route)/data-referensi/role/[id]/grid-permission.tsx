"use client";
import { useState } from "react";
import { CheckboxPermission } from "./chekbox-permission";

interface GridPemissionProps {
  resources: string[];
  actions: string[];
  permissions?: string[];
  availablePermissions: string[];
  onChange?: (permissions: string[]) => void;
}

export const GridPemission = ({
  resources,
  actions,
  permissions,
  availablePermissions,
  onChange,
}: GridPemissionProps) => {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    permissions || []
  );

  const handleCheckboxChange = (permission: string) => {
    const newPermissions = selectedPermissions.includes(permission)
      ? selectedPermissions.filter((p) => p !== permission) // Remove if already selected
      : [...selectedPermissions, permission]; // Add if not selected
    // Update the state
    setSelectedPermissions(newPermissions);
    // Call the onChange prop if provided
    onChange?.(newPermissions);
    // setSelectedPermissions(
    //   (prev) =>
    //     prev.includes(permission)
    //       ? prev.filter((p) => p !== permission) // Remove if already selected
    //       : [...prev, permission] // Add if not selected
    // );
  };

  return (
    <div className="h-fullw-full overflow-hidden border">
      {/* Header - stays fixed */}
      <div className="flex flex-row w-full sticky top-0 z-10 bg-gray-400 text-gray-50">
        <div className="flex w-4/12 border p-2">Resource</div>
        {actions?.map((action) => (
          <div key={action} className="flex w-1/12 border p-2 px-auto text-sm">
            <span>{action}</span>
          </div>
        ))}
      </div>

      {/* Scrollable content */}
      <div className="w-full h-96 overflow-y-auto">
        {resources.map((resource) => (
          <div className="flex flex-row w-full" key={resource}>
            <div className="flex w-4/12 border p-2">{resource}</div>
            {actions?.map((action) => (
              <div
                key={`${resource}-${action}`}
                className="w-1/12 border p-2 px-auto text-sm"
              >
                <CheckboxPermission
                  disabled={
                    !availablePermissions?.includes(`${action}::${resource}`)
                  }
                  permission={`${action}::${resource}`}
                  checked={
                    selectedPermissions?.includes(`${action}::${resource}`) ||
                    false
                  }
                  onChange={() =>
                    handleCheckboxChange(`${action}::${resource}`)
                  }
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
