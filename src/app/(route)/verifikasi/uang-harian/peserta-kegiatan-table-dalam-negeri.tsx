import { PesertaKegiatan } from "@prisma-honorarium/client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

// Define the type for the data
const data: PesertaKegiatan[] = [
  // Sample data goes here...
];

// Define column structure
const columns: ColumnDef<PesertaKegiatan>[] = [
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
    accessorKey: "jumlahHari",
    header: "Jumlah Hari",
    cell: (info) => info.getValue(),
  },
];

interface PesertaKegiatanTableProps {
  data: PesertaKegiatan[];
}
export const PesertaKegiatanTable = ({ data }: PesertaKegiatanTableProps) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
                  className={`p-2 border border-gray-300 ${
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
                  className={`p-2 border border-gray-300 ${
                    index < 1 ? "sticky left-0 bg-white z-10" : ""
                  } ${index === 1 ? "left-40" : "left-0"}`} // Adjust based on column width
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
