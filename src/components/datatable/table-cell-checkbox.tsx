"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { CellContext, Table } from "@tanstack/react-table";
import { use, useEffect, useState } from "react";
import { any } from "zod";

export const TableCellCheckbox = ({
  getValue,
  row,
  column,
  table,
  label = ["Yes", "No"],
}: any) => {
  const initialValue = getValue();
  const [value, setValue] = useState(false);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const toggleValue = (val: boolean) => {
    setValue(!val);
    table.options.meta?.updateData(row.index, column.id, !val);
    console.log("toggle jadi ", !val);
  };

  return (
    <div
      className="h-[70px] w-[70px] -mx-2 px-2 cursor-pointer hover:bg-blue-700 hover:rounded-full hover:text-white hover:opacity-75 flex items-center text-start justify-start gap-x-1"
      onClick={() => toggleValue(value)}
    >
      <Checkbox
        id={column.id + "-" + row.index}
        checked={value}
        // onCheckedChange={(value) => {
        //   setValue(!!value);
        //   table.options.meta?.updateData(row.index, column.id, !!value);
        // }}
        aria-label="Select row"
      />

      {value ? label[0] : label[1]}
    </div>
  );
};

export default TableCellCheckbox;
