import { PesertaKegiatanDalamNegeri } from "@/actions/kegiatan/peserta/dalam-negeri";
import { TableCellInput } from "@/components/datatable/table-cell-input";
import { cn } from "@/lib/utils";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";

// Define column structure
const columns: ColumnDef<PesertaKegiatanDalamNegeri>[] = [
  {
    accessorKey: "id",
    header: "Id",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "nama",
    header: "Nama",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "NIP",
    header: "NIP",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "pangkatGolonganId",
    header: "Pangkat/Golongan",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "jabatan",
    header: "Jabatan",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "eselon",
    header: "Eselon",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "bank",
    header: "Bank",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "namaRekening",
    header: "Nama Rekening",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "nomorRekening",
    header: "Nomor Rekening",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "uhDalamNegeri.hFullboard",
    header: "(N) Fullboard",
    cell: ({ getValue, row, column, table }) =>
      TableCellInput({
        initValue: () => getValue() ?? "",
        row,
        column,
        table,
        className: "h-18 w-18 items-center justify-center p-2 ",
      }),
    meta: {
      className: "items-center justify-center p-0 focus-within:bg-white w-20",
    },
  },
  {
    accessorKey: "uhDalamNegeri.hFulldayHalfday",
    header: "(N) Fullday/Halfday",
    cell: ({ getValue, row, column, table }) =>
      TableCellInput({
        initValue: () => getValue() ?? "",
        row,
        column,
        table,
        className: "h-18 items-center justify-center p-2 ",
      }),
    meta: {
      className: "items-center justify-center p-0 focus-within:bg-white",
    },
  },
  {
    accessorKey: "uhDalamNegeri.hDalamKota",
    header: "(N) Dalam Kota",
    cell: ({ getValue, row, column, table }) =>
      TableCellInput({
        initValue: () => getValue() ?? "",
        row,
        column,
        table,
        className: "h-18 items-center justify-center p-2 ",
      }),
    meta: {
      className: "items-center justify-center p-0 focus-within:bg-white",
    },
  },

  {
    accessorKey: "uhDalamNegeri.hLuarKota",
    header: "(N) Luar Kota",
    cell: ({ getValue, row, column, table }) =>
      TableCellInput({
        initValue: () => getValue() ?? "",
        row,
        column,
        table,
        className: "h-18 items-center justify-center p-2 ",
      }),
    meta: {
      className: "items-center justify-center p-0 focus-within:bg-white",
    },
  },
  {
    accessorKey: "uhDalamNegeri.hDiklat",
    header: "(N) Diklat",
    cell: ({ getValue, row, column, table }) =>
      TableCellInput({
        initValue: () => getValue() ?? "",
        row,
        column,
        table,
        className: "h-18 items-center justify-center p-2 ",
      }),
    meta: {
      className: "items-center justify-center p-0 focus-within:bg-white",
    },
  },
  {
    accessorKey: "uhDalamNegeri.uhTransport",
    header: "(N) Transport",
    cell: ({ getValue, row, column, table }) =>
      TableCellInput({
        initValue: () => getValue() ?? "",
        row,
        column,
        table,
        className: "h-18 items-center justify-center p-2 ",
      }),
    meta: {
      className: "items-center justify-center p-0 focus-within:bg-white",
    },
  },
  {
    accessorKey: "jumlahHari",
    header: "Jumlah Hari",
    cell: (info) => info.getValue(),
  },
];

interface PesertaKegiatanTableProps {
  data: PesertaKegiatanDalamNegeri[];
}
export const PesertaKegiatanTable = ({
  data: defaultData,
}: PesertaKegiatanTableProps) => {
  const [data, setData] = useState(() => [...defaultData]);

  useEffect(() => {
    setData(defaultData);
  }, [defaultData]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: (rowIndex: number, columnId: string, value: string) => {
        setData((old) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex],
                [columnId]: value,
              };
            }
            return row;
          })
        );
      },
    },
  });

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => (
                <th
                  key={header.id}
                  className={`p-2 border border-gray-300 min-w-18 ${
                    index < 1 ? "sticky left-0 bg-white z-10" : ""
                  } ${index === 1 ? "left-40" : "left-0"}`} // Adjust based on column width
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="even:bg-gray-50">
              {row.getVisibleCells().map((cell, index) => (
                <td
                  key={cell.id}
                  className={cn(
                    `p-2 border border-gray-300 ${
                      index < 1 ? "sticky left-0 bg-white z-10" : ""
                    } ${index === 1 ? "left-40" : "left-0"}`,
                    cell.column.columnDef.meta?.className || ""
                  )} // Adjust based on column width
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
