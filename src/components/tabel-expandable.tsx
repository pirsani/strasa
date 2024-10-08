"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CellContext,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  Table,
  useReactTable,
} from "@tanstack/react-table";
import Decimal from "decimal.js";
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Delete,
  Eye,
  Key,
  Pencil,
  Save,
  Trash,
  Trash2,
  Undo2,
} from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";

// <https://github.com/TanStack/table/discussions/5051

interface RowData {
  [key: number]: any; // Replace with actual field names and types if known
}

// Define the type for the expanded state
export type ExpandedState = {
  [key: string]: boolean;
};

export type RowDetails<T> = {
  [key: string]: T[];
};

interface TabelExpandableProps<T, R> {
  data: T[];
  columns: ColumnDef<T>[];
  renderExpandedRowDetails: (row: T, details: R[]) => React.ReactNode;
  rowDetails: RowDetails<R>;
  expanded: ExpandedState;
  setExpanded: React.Dispatch<React.SetStateAction<ExpandedState>>;
  frozenColumnCount?: number;
}

export const TabelExpandable = <T, R>({
  data: initialData,
  columns,
  renderExpandedRowDetails,
  rowDetails,
  expanded,
  setExpanded,
  frozenColumnCount = 1,
}: TabelExpandableProps<T, R>) => {
  const [data, setData] = useState(initialData); // Assuming `initialData` is your table data

  const [pageSize, setPageSize] = useState(10); // Set the initial page size
  const [pageIndex, setPageIndex] = useState(0); // Set the initial page index
  const [sorting, setSorting] = useState<SortingState>([]); // Explicitly define SortingState
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    columnId: string;
  } | null>(null);
  const [updatedValues, setUpdatedValues] = useState<{ [key: string]: any }>(
    {}
  );

  const [cumulativeWidths, setCumulativeWidths] = useState<number[]>([]);
  const colRefs = useRef<HTMLTableCellElement[]>([]);

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

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    //console.log("updatedValues", updatedValues);
    console.log("expanded updated", expanded);
  }, [expanded]);

  return (
    <div>
      <div className="overflow-x-auto w-full pb-6">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            {table.getHeaderGroups().map((headerGroup, index) => (
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
                        header.column.columnDef.meta?.className,
                        // !isExpanded &&
                        //   header.column.columnDef.meta?.showOnExpand &&
                        //   "hidden",
                        // isExpanded &&
                        //   header.column.columnDef.meta?.hideOnExpand &&
                        //   "hidden",
                        "px-2 border border-gray-300",
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
                      onClick={header.column.getToggleSortingHandler()} // Enable sorting on click
                    >
                      <div
                        className={cn(
                          "flex flex-row items-center w-full h-full"
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
                          <span className="hover:cursor-pointer">
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
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, rowIndex) => (
              <Fragment key={row.id}>
                <tr key={row.id} className="odd:bg-white even:bg-gray-50">
                  {row.getVisibleCells().map((cell, index) => {
                    const field = cell.column.columnDef.meta?.field;

                    // This will ensure TypeScript understands that row.original can be indexed by a string.
                    // This will ensure TypeScript understands that row.original can be indexed by a string.

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
                          "px-2 border border-gray-300 ",
                          // !isExpanded &&
                          //   cell.column.columnDef.meta?.showOnExpand &&
                          //   "hidden",
                          // isExpanded &&
                          //   cell.column.columnDef.meta?.hideOnExpand &&
                          //   "hidden",
                          {
                            [`sticky left-0 bg-gray-100 z-${10 - index}`]:
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
                        {(() => {
                          if (cell.column.id === "rowNumber") {
                            // Display the row number, considering pagination
                            return rowIndex + 1 + pageSize * pageIndex;
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
                {expanded[row.id] && (
                  <>
                    {renderExpandedRowDetails(row.original, rowDetails[row.id])}
                  </>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationControls table={table} />
    </div>
  );
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

// interface Aksi {
//   aksi: "edit" | "delete" | "view";
// }
export const KolomPilihanAksi = <T,>(
  info: CellContext<T, unknown>,
  aksi: Array<"edit" | "delete" | "view">,
  isEditing?: boolean,
  onEdit?: (row: Row<T>) => void,
  onDelete?: (row: T) => void,
  onView?: (row: T) => void
) => {
  const handleOnClickEdit = () => {
    //console.log("Edit clicked");
    onEdit && onEdit(info.row);
  };

  const handleOnClickDelete = () => {
    //console.log("Delete clicked");
    onDelete && onDelete(info.row.original);
  };

  const handleOnClickView = () => {
    //console.log("View clicked");
    onView && onView(info.row.original);
  };
  return (
    <>
      <div className="flex gap-2">
        {aksi.map((item) => {
          switch (item) {
            case "edit":
              return (
                <Button
                  key={item}
                  variant="secondary"
                  size="sm"
                  onClick={handleOnClickEdit}
                >
                  <Pencil size={20} />
                </Button>
              );
            case "delete":
              return (
                <Button
                  key={item}
                  variant="secondary"
                  size="sm"
                  onClick={handleOnClickDelete}
                >
                  <Trash2 size={20} />
                </Button>
              );
            case "view":
              return (
                <Button
                  key={item}
                  variant="secondary"
                  size="sm"
                  onClick={handleOnClickView}
                >
                  <Eye size={20} />
                </Button>
              );
            default:
              return null;
          }
        })}
      </div>
    </>
  );
};

export const KolomAksi = <T,>(
  info: CellContext<T, unknown>,
  onEdit?: (row: Row<T>) => void,
  onDelete?: (row: T) => void,
  onView?: (row: T) => void,
  isEditing?: boolean
) => {
  const [oldRow, setOldRow] = useState<T>(info.row.original);

  const handleOnClickEdit = () => {
    //console.log("Edit clicked");
    onEdit && onEdit(info.row);
  };

  const handleOnClickDelete = () => {
    //console.log("Delete clicked");
    onDelete && onDelete(info.row.original);
  };

  const handleOnClickView = () => {
    //console.log("View clicked");
    onView && onView(info.row.original);
  };

  return (
    <>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={handleOnClickEdit}>
          <Pencil size={20} />
        </Button>
        <Button variant="secondary" size="sm" onClick={handleOnClickDelete}>
          <Trash2 size={20} />
        </Button>
        <Button variant="secondary" size="sm" onClick={handleOnClickView}>
          <Eye size={20} />
        </Button>
      </div>
    </>
  );
};

export const formatCurrency = <T,>(info: CellContext<T, unknown>) => {
  const value = info.getValue() as number;

  // Format the value as currency
  const formattedValue = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

  // Format the value as a plain number
  const formattedNumber = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

  // Extract the currency symbol by removing the formatted number from the formatted value
  const currencySymbol = formattedValue.replace(formattedNumber, "").trim();

  return (
    <div className="flex flex-row w-full justify-between items-center">
      <span className="mr-2">{currencySymbol}</span> {/* Currency symbol */}
      <span className="ml-2">{formattedNumber}</span> {/* Number */}
    </div>
  );
};
