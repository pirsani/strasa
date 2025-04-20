"use client";
import { useState } from "react";
import { CheckboxPermission } from "./chekbox-permission";

interface GridPemissionProps {
  resources: string[];
  actions: string[];
  permissions?: string[];
}

export const GridPemission = ({
  resources,
  actions,
  permissions,
}: GridPemissionProps) => {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    permissions || []
  );

  const handleCheckboxChange = (permission: string) => {
    setSelectedPermissions(
      (prev) =>
        prev.includes(permission)
          ? prev.filter((p) => p !== permission) // Remove if already selected
          : [...prev, permission] // Add if not selected
    );
  };

  return (
    <div className="h-[32rem] w-full overflow-hidden border">
      {/* Header - stays fixed */}
      <div className="flex flex-row w-full bg-yellow-200 sticky top-0 z-10">
        <div className="flex w-1/4 border p-2">Resource</div>
        {actions?.map((action) => (
          <div key={action} className="flex w-1/12 border p-2 px-auto text-sm">
            <span>{action}</span>
          </div>
        ))}
      </div>

      {/* Scrollable content */}
      <div className="w-full h-full overflow-y-auto">
        {resources.map((resource) => (
          <div className="flex flex-row w-full" key={resource}>
            <div className="flex w-1/4 border p-2">{resource}</div>
            {actions?.map((action) => (
              <div
                key={`${resource}-${action}`}
                className="flex w-1/12 border p-2 px-auto text-sm"
              >
                <CheckboxPermission
                  permission={`${action}:${resource}`}
                  checked={
                    selectedPermissions?.includes(`${action}:${resource}`) ||
                    false
                  }
                  onChange={() => handleCheckboxChange(`${action}:${resource}`)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
