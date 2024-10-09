"use client";
import { Cell, CellContext, TableMeta } from "@tanstack/react-table";
import React, { TextareaHTMLAttributes, useEffect, useState } from "react";

export interface TableCellTextareaProps
  extends CellContext<any, any>,
    TextareaHTMLAttributes<HTMLTextAreaElement> {}

interface TMetas extends TableMeta<unknown> {
  updateData: (rowIndex: number, columnId: string, value: string) => void;
}

export const TableCellTextarea = ({
  getValue,
  row,
  column,
  table,
  ...props
}: Omit<TableCellTextareaProps, "cell" | "renderValue">) => {
  const initialValue = getValue();
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const onBlur = () => {
    (table.options.meta as TMetas).updateData(row.index, column.id, value);
  };

  // TODO : how to make rows and cols dynamic?

  return (
    <textarea
      className="w-full h-full"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      {...props}
    />
  );
};

export default TableCellTextarea;
