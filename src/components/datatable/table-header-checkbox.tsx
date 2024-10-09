"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Column, Table } from "@tanstack/react-table";
import { useEffect, useState } from "react";

interface ITableHeaderCheckboxProps {
  column: Column<any>;
  table: Table<any>;
  label: string;
}

export const TableHeaderCheckbox = ({
  column,
  table,
  label,
}: ITableHeaderCheckboxProps) => {
  if (
    !table.options.meta?.getIsAllTrue ||
    !table.options.meta?.toggleAllBoolean ||
    !table.options.meta?.getIsSomeTrue ||
    !table.options.meta?.changeAllOptions
  ) {
    console.error("meta is not available");
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-x-1 ">
      <Checkbox
        checked={
          table.options.meta?.getIsAllTrue(column.id) ||
          (table.options.meta?.getIsSomeTrue(column.id) && "indeterminate")
        }
        onCheckedChange={(value) =>
          table.options.meta?.toggleAllBoolean &&
          table.options.meta.toggleAllBoolean(column.id, !value)
        }
        aria-label="Select all"
      />
      <span>{label}</span>
    </div>
  );
};

export default TableHeaderCheckbox;
