"use client";
import { Column, Row, Table } from "@tanstack/react-table";
import { useEffect, useState } from "react";

// <https://muhimasri.com/blogs/react-editable-table/>

interface ITableCellProps {
  getValue: () => any;
  row: Row<any>;
  column: Column<any>;
  table: Table<any>;
}
export const TableCell = ({
  getValue,
  row,
  column,
  table,
}: ITableCellProps) => {
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      (table.options.meta.updateData as Function)(row.index, column.id, value);
    } else {
      console.log("updateData method is not available");
    }
  };

  return (
    <textarea
      className="w-full h-full"
      rows={5}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
    />
  );
};

export default TableCell;
