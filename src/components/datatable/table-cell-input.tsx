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
  type?: "text" | "number";
}
export const TableCellInput = <T,>({
  getValue,
  row,
  column,
  table,
  handleOnBlur = () => {},
  className,
  type = "number",
}: ITableCellProps<T>) => {
  //const initialValue = getValue();
  const [value, setValue] = useState(getValue());

  useEffect(() => {
    setValue(getValue());
  }, [getValue()]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <input
      value={value}
      placeholder={type === "number" ? "0" : ""}
      className={cn(
        `w-full items-center min-h-12 w-20 border-0 border-transparent focus:ring-0 
    bg-transparent p-2 outline-none`,
        className
      )}
      onChange={handleChange} // Update local value
      onBlur={onBlur} // Save changes on blur
    />
  );
};

export default TableCellInput;
