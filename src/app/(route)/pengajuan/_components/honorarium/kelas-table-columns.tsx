"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronRight } from "lucide-react";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Kelas = {
  id: string;
  kelas: string;
  tanggal: Date;
  materi: string;
};

export const columns: ColumnDef<Kelas>[] = [
  {
    id: "expander", // ID for the expander column
    header: () => null, // Empty header for the expander column
    cell: ({ row }) => (
      <span
        className="cursor-pointer"
        //onClick={() => row.toggleExpanded()} // Toggle row expansion
      >
        {row.getIsExpanded() ? (
          <ChevronDown
            size={12}
            className="rounded-full text-white bg-blue-500"
          />
        ) : (
          <ChevronRight size={12} className="rounded-full" />
        )}{" "}
        {/* Plus/Minus sign for expansion */}
      </span>
    ),
  },
  {
    accessorKey: "kelas",
    header: "Kelas",
  },
  {
    accessorKey: "tanggal",
    header: "Tanggal",
  },
  {
    accessorKey: "materi",
    header: "Materi",
  },
];
