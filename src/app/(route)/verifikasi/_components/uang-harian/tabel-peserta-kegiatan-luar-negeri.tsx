import { PesertaKegiatanLuarNegeri } from "@/actions/kegiatan/peserta/luar-negeri";
import { TableCellInput } from "@/components/datatable/table-cell-input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  Table,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDownUp, ChevronLeft, ChevronRight } from "lucide-react";
import React, { Fragment, useEffect, useRef, useState } from "react";

interface RowData {
  [key: string]: any; // Replace with actual field names and types if known
}
// Define column structure
const columns: ColumnDef<PesertaKegiatanLuarNegeri>[] = [
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
    header: "Pangkat/ Golongan",
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
  // {
  //   accessorKey: "email",
  //   header: "Email",
  //   cell: (info) => info.getValue(),
  // },
  // {
  //   accessorKey: "bank",
  //   header: "Bank",
  //   cell: (info) => info.getValue(),
  // },
  // {
  //   accessorKey: "namaRekening",
  //   header: "Nama Rekening",
  //   cell: (info) => info.getValue(),
  // },
  // {
  //   accessorKey: "nomorRekening",
  //   header: "Nomor Rekening",
  //   cell: (info) => info.getValue(),
  // },
  {
    accessorKey: "uhLuarNegeri.hFullboard",
    header: "Hari Fullboard",
    cell: ({ getValue, row, column, table }) =>
      TableCellInput({
        getValue,
        row,
        column,
        table,
        className: "h-18 items-center justify-center p-2 ",
      }),
    meta: {
      className: "items-center justify-center p-0 max-w-18",
    },
  },
  {
    accessorKey: "uhLuarNegeri.hFulldayHalfday",
    header: "Hari Fullday/ Halfday",
    cell: ({ getValue, row, column, table }) =>
      TableCellInput({
        getValue,
        row,
        column,
        table,
        className: "h-18 items-center justify-center p-2 ",
      }),
    meta: {
      className: "items-center justify-center p-0 max-w-18",
    },
  },
  {
    accessorKey: "uhLuarNegeri.hDalamKota",
    header: "Hari Dalam Kota",
    cell: ({ getValue, row, column, table }) =>
      TableCellInput({
        getValue,
        row,
        column,
        table,
        className: "h-18 items-center justify-center p-2 ",
      }),
    meta: {
      className: "items-center justify-center p-0 max-w-18",
    },
  },

  {
    accessorKey: "uhLuarNegeri.hLuarKota",
    header: "Hari Luar Kota",
    cell: ({ getValue, row, column, table }) =>
      TableCellInput({
        getValue,
        row,
        column,
        table,
        className: "h-18 items-center justify-center p-2 ",
      }),
    meta: {
      className: "items-center justify-center p-0 max-w-18",
    },
  },
  {
    accessorKey: "uhLuarNegeri.hDiklat",
    header: "Hari Diklat",
    cell: ({ getValue, row, column, table }) =>
      TableCellInput({
        getValue,
        row,
        column,
        table,
        className: "h-18 items-center justify-center p-2 ",
      }),
    meta: {
      className: "items-center justify-center p-0 max-w-18",
    },
  },
  {
    accessorKey: "uhLuarNegeri.hTransport",
    header: "Hari Transport",
    cell: ({ getValue, row, column, table }) =>
      TableCellInput({
        getValue,
        row,
        column,
        table,
        className: "h-18 items-center justify-center p-2 ",
      }),
    meta: {
      className: "items-center justify-center p-0 max-w-18",
    },
  },
  {
    accessorKey: "uhLuarNegeri.jumlahHari",
    header: "Jumlah Hari",
    cell: (info) => {
      const value = info.getValue() as number;
      return (
        <div className="w-full h-full flex items-center justify-center p-2 border-none">
          {value}
        </div>
      );
    },
    meta: {
      className: "items-center justify-center p-0 max-w-18",
    },
  },
];

interface TabelHariPesertaKegiatanProps {
  data: PesertaKegiatanLuarNegeri[];
  onDataChange?: (data: PesertaKegiatanLuarNegeri[]) => void;
}
export const TabelHariPesertaKegiatan = ({
  data: defaultData,
  onDataChange = () => {},
}: TabelHariPesertaKegiatanProps) => {
  const [data, setData] = useState(() => [...defaultData]);
  const [pageSize, setPageSize] = useState(10); // Set the initial page size
  const [pageIndex, setPageIndex] = useState(0); // Set the initial page index
  const [sorting, setSorting] = useState<SortingState>([]); // Explicitly define SortingState
  const [cumulativeWidths, setCumulativeWidths] = useState<number[]>([]);
  const colRefs = useRef<HTMLTableCellElement[]>([]);
  const frozenColumnCount = 1;
  const [headerColumnHfullboard, setHeaderColumnHfullboard] = useState(0);
  const [headerColumnHfulldayHalfday, setHeaderColumnHfulldayHalfday] =
    useState(0);
  const [headerColumnHluarKota, setHeaderColumnHluarKota] = useState(0);
  const [headerColumnHdalamKota, setHeaderColumnHdalamKota] = useState(0);
  const [headerColumnHdiklat, setHeaderColumnHdiklat] = useState(0);
  const [headerColumnHtransport, setHeaderColumnHtransport] = useState(0);
  const [totalJumlahHari, setTotalJumlahHari] = useState(0);

  useEffect(() => {
    onDataChange(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    const total =
      headerColumnHfullboard +
      headerColumnHfulldayHalfday +
      headerColumnHdalamKota +
      headerColumnHluarKota +
      headerColumnHdiklat +
      headerColumnHtransport;
    setTotalJumlahHari(total);

    const updatedPeserta = data.map((row) => {
      const newRow = calculateTotal(row);
      return newRow;
    });

    setData(updatedPeserta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    headerColumnHfullboard,
    headerColumnHfulldayHalfday,
    headerColumnHdalamKota,
    headerColumnHluarKota,
    headerColumnHdiklat,
    headerColumnHtransport,
  ]);

  useEffect(() => {
    setData(defaultData);
  }, [defaultData]);

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(data.length / pageSize), // Dynamic page count
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
      sorting, // Add sorting state to the table
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(), // Sorting model
    onSortingChange: setSorting, // Handle sorting state changes
    onPaginationChange: (updater) => {
      const nextPagination =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(nextPagination.pageIndex);
      setPageSize(nextPagination.pageSize);
    },
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
                    [actualColumnId]: Number.isNaN(parseInt(value))
                      ? 0
                      : parseInt(value),
                  },
                };

                const newRowWithUpdatedTotal = calculateTotal(
                  newRow as PesertaKegiatanLuarNegeri
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

  useEffect(() => {
    if (
      frozenColumnCount > 0 &&
      colRefs.current &&
      colRefs.current.length >= frozenColumnCount
    ) {
      const colWidths = colRefs.current.map(
        (col) => col.getBoundingClientRect().width
      );
      const cumulativeWidths = colWidths.reduce(
        (acc, width) => [...acc, acc[acc.length - 1] + width],
        [0]
      );
      setCumulativeWidths(cumulativeWidths);
      //console.log("cumulativeWidths", cumulativeWidths);
    }
  }, [frozenColumnCount, colRefs]); // Only run when frozen column count or refs change
  //[table.getRowModel().rows]); // Recalculate when rows change

  interface HeaderInputColumnProps {
    peserta: PesertaKegiatanLuarNegeri[];
    field?: string;
    setColumValaue?: React.Dispatch<React.SetStateAction<number>>;
    value?: number;
  }
  const HeaderInputColumn = ({
    peserta,
    field,
    setColumValaue,
    value: initValue,
  }: HeaderInputColumnProps) => {
    const [value, setValue] = useState(initValue);

    useEffect(() => {
      setValue(initValue);
    }, [initValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(parseInt(e.target.value));
    };

    const handleBlur = () => {
      console.log("value", value);

      if (!field) {
        return;
      }
      const updatedPeserta = changeAllRowsColumnUhLuarNegeri(
        peserta,
        field,
        value ? value : 0
      );
      setColumValaue && setColumValaue(value || 0);
      setData((old) => updatedPeserta);
      console.log("updatedPeserta", updatedPeserta);
    };

    return (
      <th className="p-0 border border-gray-300 focus-within:border-blue-500 focus-within:border-2">
        <input
          placeholder="0"
          value={value || 0}
          onChange={handleChange}
          className="w-full h-12 focus:ring-0 bg-transparent p-2 outline-none border-none"
          onBlur={handleBlur}
          tabIndex={0} // Ensure the input is focusable
        />
      </th>
    );
  };

  return (
    <div>
      <div className="overflow-x-auto w-full pb-6">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            {table.getHeaderGroups().map((headerGroup, index) => {
              return (
                <Fragment key={headerGroup.id}>
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header, index) => {
                      const columnRelativeDepth =
                        header.depth - header.column.depth;
                      if (columnRelativeDepth > 1) {
                        return null;
                      }

                      let rowSpan = 1;
                      if (header.isPlaceholder) {
                        const leafs = header.getLeafHeaders();
                        rowSpan = leafs[leafs.length - 1].depth - header.depth;
                      }

                      const isGroupHeader =
                        header.subHeaders && header.subHeaders.length > 1;

                      return (
                        <th
                          key={header.id}
                          ref={(el) => {
                            if (
                              index < frozenColumnCount &&
                              el instanceof HTMLTableCellElement
                            ) {
                              colRefs.current[index] = el;
                            }
                          }}
                          colSpan={header.colSpan}
                          rowSpan={rowSpan}
                          className={cn(
                            "px-2 py-1 border border-gray-300",
                            !isGroupHeader
                              ? "hover:cursor-pointer bg-gray-50"
                              : "bg-gray-100",

                            {
                              [`sticky left-0 z-${10 - index}`]:
                                index < frozenColumnCount, // Sticky columns
                              "left-0": index >= frozenColumnCount, // Default position for other columns
                            }
                          )}
                          style={
                            index < frozenColumnCount
                              ? { left: `${cumulativeWidths[index] || 0}px` }
                              : undefined
                          }
                        >
                          <div
                            className={cn(
                              "flex flex-row items-center w-full h-full gap-2"
                            )}
                          >
                            {/* {header.isPlaceholder ? "y" : "n"}
        {header.column.columnDef.header ? "y" : "n"} */}
                            <span className="flex-grow">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </span>
                            {/* Sorting icon only for non-grouped columns */}
                            {!isGroupHeader && header.column.getCanSort() && (
                              <span
                                className="hover:cursor-pointer"
                                onClick={header.column.getToggleSortingHandler()} // Enable sorting on click
                              >
                                {(() => {
                                  const sortOrder = header.column.getIsSorted();
                                  if (sortOrder === false) {
                                    return <ArrowDownUp size={16} />; // Not sorted icon
                                  }
                                  return sortOrder === "asc" ? "🔼" : "🔽"; // Sort ascending/descending icon
                                })()}
                              </span>
                            )}
                            {/* {isGroupHeader && (
      <span className="hover:cursor-pointer">
        {header.subHeaders.length}
      </span>
        )} */}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                  <tr key={"_coli" + headerGroup.id}>
                    <th colSpan={5} className="px-2 border border-gray-300">
                      {""}
                    </th>
                    <HeaderInputColumn
                      peserta={data}
                      field="hFullboard"
                      setColumValaue={setHeaderColumnHfullboard}
                      value={headerColumnHfullboard}
                    />
                    <HeaderInputColumn
                      peserta={data}
                      field="hFulldayHalfday"
                      setColumValaue={setHeaderColumnHfulldayHalfday}
                      value={headerColumnHfulldayHalfday}
                    />
                    <HeaderInputColumn
                      peserta={data}
                      field="hDalamKota"
                      setColumValaue={setHeaderColumnHdalamKota}
                      value={headerColumnHdalamKota}
                    />
                    <HeaderInputColumn
                      peserta={data}
                      field="hLuarKota"
                      setColumValaue={setHeaderColumnHluarKota}
                      value={headerColumnHluarKota}
                    />
                    <HeaderInputColumn
                      peserta={data}
                      field="hDiklat"
                      setColumValaue={setHeaderColumnHdiklat}
                      value={headerColumnHdiklat}
                    />
                    <HeaderInputColumn
                      peserta={data}
                      field="hTransport"
                      setColumValaue={setHeaderColumnHtransport}
                      value={headerColumnHtransport}
                    />
                    <th className="px-2 border border-gray-300">
                      {totalJumlahHari}
                    </th>
                  </tr>
                </Fragment>
              );
            })}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, rowIndex) => (
              <tr key={row.id} className="odd:bg-white even:bg-gray-50">
                {row.getVisibleCells().map((cell, index) => {
                  const field = cell.column.columnDef.meta?.field;
                  //This will ensure TypeScript understands that row.original can be indexed by a string.
                  const fieldValue = field
                    ? (row.original as RowData)[field]
                    : undefined;
                  return (
                    <td
                      key={cell.id}
                      ref={(el) => {
                        if (
                          index < frozenColumnCount &&
                          el instanceof HTMLTableCellElement
                        ) {
                          colRefs.current[index] = el;
                        }
                      }}
                      className={cn(
                        "px-2 py-1 border border-gray-300 focus-within:border-blue-500 focus-within:border-2",
                        {
                          [`sticky left-0 bg-gray-100 z-${10 - index}`]:
                            index < frozenColumnCount, // Sticky columns
                          "left-0": index >= frozenColumnCount, // Default position for other columns
                        },
                        cell.column.columnDef.meta?.className
                      )}
                      style={
                        index < frozenColumnCount
                          ? { left: `${cumulativeWidths[index] || 0}px` }
                          : undefined
                      }
                    >
                      {(() => {
                        if (cell.column.id === "rowNumber") {
                          // Display the row number, considering pagination
                          return rowIndex + 1 + pageSize * pageIndex;
                        }

                        if (cell.column.id === "_additionalKolomAksi") {
                          // Always render the "aksi" column with flexRender

                          return flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          );
                        }

                        // Display the cell value if not in edit mode
                        return flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        );
                      })()}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationControls table={table} />
    </div>
  );
};

const changeAllRowsColumnUhLuarNegeri = (
  peserta: PesertaKegiatanLuarNegeri[],
  field: string,
  value: number
): PesertaKegiatanLuarNegeri[] => {
  return peserta.map((row) => {
    if (!row.uhLuarNegeri) {
      return row;
    }
    const uhLuarNegeri = row.uhLuarNegeri;
    const newUh = {
      ...uhLuarNegeri,
      [field]: value,
    };
    return {
      ...row,
      ["uhLuarNegeri"]: newUh,
    };
  });
};

interface PaginationControlsProps<T> {
  table: Table<T>;
}

export const PaginationControls = <T,>({
  table,
}: PaginationControlsProps<T>) => {
  const [jumpPage, setJumpPage] = useState(
    table.getState().pagination.pageIndex + 1
  );
  const pageCount = table.getPageCount();

  const handlePageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const page = Number(e.target.value);
    if (page >= 1 && page <= table.getPageCount()) {
      table.setPageIndex(page - 1); // pageIndex is zero-based
    }
  };

  return (
    <div className="my-2 flex flex-row gapx-2 sm:gap-2 items-center">
      {/* Pagination controls */}
      <Button
        variant={"outline"}
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
        className="p-2"
      >
        <ChevronLeft size={24} />
        <span className="hidden sm:block">Previous</span>
      </Button>

      <select
        value={table.getState().pagination.pageIndex + 1}
        onChange={handlePageChange}
        className="mx-2 p-2 rounded-sm border border-gray-300"
      >
        {Array.from({ length: pageCount }, (_, i) => (
          <option key={i} value={i + 1}>
            Page {i + 1} of {pageCount}
          </option>
        ))}
      </select>

      <Button
        variant={"outline"}
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
        className="p-2"
      >
        <ChevronRight size={24} />
        <span className="hidden sm:block">Next</span>
      </Button>

      {/* Select page size */}
      <select
        value={table.getState().pagination.pageSize}
        onChange={(e) => table.setPageSize(Number(e.target.value))}
        className="mx-2 p-2 rounded-sm border border-gray-300"
      >
        {[5, 10, 20, 30, 40, 50].map((pageSize) => (
          <option key={pageSize} value={pageSize}>
            Show {pageSize}
          </option>
        ))}
      </select>
    </div>
  );
};

function calculateTotal(
  row: PesertaKegiatanLuarNegeri
): PesertaKegiatanLuarNegeri {
  if (!row.uhLuarNegeri) {
    return row;
  }
  const fullboard = row.uhLuarNegeri?.hFullboard || 0;
  const fulldayHalfday = row.uhLuarNegeri?.hFulldayHalfday || 0;
  const dalamKota = row.uhLuarNegeri?.hDalamKota || 0;
  const luarKota = row.uhLuarNegeri?.hLuarKota || 0;
  const diklat = row.uhLuarNegeri?.hDiklat || 0;
  const transport = row.uhLuarNegeri?.hTransport || 0;

  const total: number =
    fullboard + fulldayHalfday + dalamKota + luarKota + diklat + transport;

  return {
    ...row,
    uhLuarNegeri: {
      ...row.uhLuarNegeri,
      jumlahHari: total,
    },
  };
}
