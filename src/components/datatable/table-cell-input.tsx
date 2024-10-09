"use client";
import { cn } from "@/lib/utils";
import { Column, Row, Table } from "@tanstack/react-table";
import { useEffect, useState } from "react";

// <https://muhimasri.com/blogs/react-editable-table/>

interface ITableCellProps<T> {
  initValue: any;
  row: Row<T>;
  column: Column<T>;
  table: Table<T>;
  handleOnBlur?: (value: string | number) => void;
  className?: string;
}
export const TableCellInput = <T,>({
  initValue,
  row,
  column,
  table,
  handleOnBlur = () => {},
  className,
}: ITableCellProps<T>) => {
  const initialValue = initValue || "";
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const onBlur = () => {
    if (
      table.options.meta &&
      typeof table.options.meta.updateData === "function"
    ) {
      (table.options.meta.updateData as Function)(row.index, column.id, value);
      handleOnBlur(value);
    } else {
      console.error("updateData method is not available");
    }
  };

  return (
    <input
      value={value || ""}
      className={cn(
        `items-center min-h-12 w-20 border-0 border-transparent focus:ring-0 
    bg-transparent p-2 outline-none`,
        className
      )}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
    />
  );
};

export default TableCellInput;
