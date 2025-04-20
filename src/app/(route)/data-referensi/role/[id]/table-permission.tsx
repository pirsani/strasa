"use client";
import { useState } from "react";
import { CheckboxPermission } from "./chekbox-permission";

interface TablePemissionProps {
  resources: string[];
  actions: string[];
  permissions?: string[];
}

export const TablePermission = ({
  resources,
  actions,
  permissions,
}: TablePemissionProps) => {
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
    <table className="w-full table-auto border-collapse border border-gray-300">
      <thead className="sticky top-[76px] bg-gray-200">
        <tr>
          <th className="border border-gray-300 p-2 w-1/6">Resource</th>
          {actions.map((action) => (
            <th key={action} className="border border-gray-300 p-2">
              {action}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="max-h-[500px] overflow-y-auto">
        {resources.map((resource) => (
          <tr key={resource} className="hover:bg-blue-300 w-1/6">
            <td className="border border-gray-300 p-2">{resource}</td>
            {actions.map((action) => (
              <td
                key={`${resource}-${action}`}
                className="border border-gray-300 p-2 items-center"
              >
                <CheckboxPermission
                  permission={`${action}:${resource}`}
                  checked={
                    selectedPermissions?.includes(`${action}:${resource}`) ||
                    false
                  }
                  onChange={() => handleCheckboxChange(`${action}:${resource}`)}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
