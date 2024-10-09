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
        getValue,
        row,
        column,
        table,
        className: "h-18 items-center justify-center p-2 ",
      }),
    meta: {
      className:
        "items-center justify-center p-0 focus-within:bg-white focus-within:border-2 focus-within:border-blue-500 max-w-18",
    },
  },
  {
    accessorKey: "uhDalamNegeri.hFulldayHalfday",
    header: "(N) Fullday/ Halfday",
    cell: ({ getValue, row, column, table }) =>
      TableCellInput({
        getValue,
        row,
        column,
        table,
        className: "h-18 items-center justify-center p-2 ",
      }),
    meta: {
      className:
        "items-center justify-center p-0 focus-within:bg-white focus-within:border-2 focus-within:border-blue-500 max-w-18",
    },
  },
  {
    accessorKey: "uhDalamNegeri.hDalamKota",
    header: "(N) Dalam Kota",
    cell: ({ getValue, row, column, table }) =>
      TableCellInput({
        getValue,
        row,
        column,
        table,
        className: "h-18 items-center justify-center p-2 ",
      }),
    meta: {
      className:
        "items-center justify-center p-0 focus-within:bg-white focus-within:border-2 focus-within:border-blue-500 max-w-18",
    },
  },

  {
    accessorKey: "uhDalamNegeri.hLuarKota",
    header: "(N) Luar Kota",
    cell: ({ getValue, row, column, table }) =>
      TableCellInput({
        getValue,
        row,
        column,
        table,
        className: "h-18 items-center justify-center p-2 ",
      }),
    meta: {
      className:
        "items-center justify-center p-0 focus-within:bg-white focus-within:border-2 focus-within:border-blue-500 max-w-18",
    },
  },
  {
    accessorKey: "uhDalamNegeri.hDiklat",
    header: "(N) Diklat",
    cell: ({ getValue, row, column, table }) =>
      TableCellInput({
        getValue,
        row,
        column,
        table,
        className: "h-18 items-center justify-center p-2 ",
      }),
    meta: {
      className:
        "items-center justify-center p-0 focus-within:bg-white focus-within:border-2 focus-within:border-blue-500 max-w-18",
    },
  },
  {
    accessorKey: "uhDalamNegeri.uhTransport",
    header: "(N) Transport",
    cell: ({ getValue, row, column, table }) =>
      TableCellInput({
        getValue,
        row,
        column,
        table,
        className: "h-18 items-center justify-center p-2 ",
      }),
    meta: {
      className:
        "items-center justify-center p-0 focus-within:bg-white focus-within:border-2 focus-within:border-blue-500 max-w-18",
    },
  },
  {
    accessorKey: "uhDalamNegeri.jumlahHari",
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

  const calculateTotal = (
    row: PesertaKegiatanDalamNegeri
  ): PesertaKegiatanDalamNegeri => {
    if (!row.uhDalamNegeri) {
      return row;
    }
    const fullboard = row.uhDalamNegeri?.hFullboard || 0;
    const fulldayHalfday = row.uhDalamNegeri?.hFulldayHalfday || 0;
    const dalamKota = row.uhDalamNegeri?.hDalamKota || 0;
    const luarKota = row.uhDalamNegeri?.hLuarKota || 0;
    const diklat = row.uhDalamNegeri?.hDiklat || 0;
    const transport = row.uhDalamNegeri?.uhTransport || 0;

    const total: number =
      fullboard + fulldayHalfday + dalamKota + luarKota + diklat + transport;

    return {
      ...row,
      uhDalamNegeri: {
        ...row.uhDalamNegeri,
        jumlahHari: total,
      },
    };
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: (rowIndex: number, columnId: string, value: string) => {
        setData((old) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              let parentObj = null;
              let actualColumnId = columnId;

              console.log("columnId", columnId);

              if (columnId.includes("_")) {
                const parts = columnId.split("_");
                parentObj = parts[0];
                actualColumnId = parts[1];
              }

              let newRow = {
                ...old[rowIndex],
              };

              if (parentObj) {
                newRow = {
                  ...newRow,
                  [parentObj]: {
                    ...(newRow[parentObj as keyof typeof newRow] as any),
                    [actualColumnId]: parseInt(value),
                  },
                };

                const newRowWithUpdatedTotal = calculateTotal(
                  newRow as PesertaKegiatanDalamNegeri
                );
                console.log("newRowWithUpdatedTotal", newRowWithUpdatedTotal);
                return newRowWithUpdatedTotal;
              } else {
                newRow = {
                  ...newRow,
                  [actualColumnId]: value,
                };
              }
              return newRow;
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
                  className={`p-2 border border-gray-300 w-12 ${
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
