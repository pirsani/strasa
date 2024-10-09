"use client";
import { cn } from "@/lib/utils";
import { Column, Row, Table } from "@tanstack/react-table";
import { useEffect, useState } from "react";

// <https://muhimasri.com/blogs/react-editable-table/>

interface ITableCellProps<T> {
  getValue: () => any;
  row: Row<T>;
  column: Column<T>;
  table: Table<T>;
  handleOnBlur?: (value: string | number) => void;
  className?: string;
}
export const TableCellInput = <T,>({
  getValue,
  row,
  column,
  table,
  handleOnBlur = () => {},
  className,
}: ITableCellProps<T>) => {
  const initialValue = getValue();
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const onBlur = () => {
    if (
      table.options.meta &&
      typeof table.options.meta.updateData === "function"
    ) {
      console.log("row.index", row);
      (table.options.meta.updateData as Function)(row.index, column.id, value);
      handleOnBlur(value);
      console.log("column.id", column.id);
    } else {
      console.error("updateData method is not available");
    }
  };

  return (
    <input
      value={value}
      className={cn(
        `items-center min-h-12 w-20 border-0 border-transparent focus:ring-0 
    bg-transparent p-2 outline-none`,
        className
      )}
      onChange={(e) => setValue(e.target.value)} // Update local value
      onBlur={onBlur} // Save changes on blur
    />
  );
};

export default TableCellInput;
