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
  Pencil,
  Save,
  Trash,
  Trash2,
  Undo2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";

// <https://github.com/TanStack/table/discussions/5051

interface RowData {
  [key: string]: any; // Replace with actual field names and types if known
}

interface TabelGenericProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  frozenColumnCount?: number;
  isEditing?: boolean;
  editableRowId?: string | null;
}

export const TabelGeneric = <T,>({
  data: initialData,
  columns,
  frozenColumnCount = 1,
  isEditing = false,
  editableRowId = null,
}: TabelGenericProps<T>) => {
  const [data, setData] = useState(initialData); // Assuming `initialData` is your table data
  //const [isEditing, setIsEditing] = useState(initialIsEditing);
  // const [editableRowId, setEditableRowId] = useState<string | null>(
  //   initialEditableRowId
  // );

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

  const handleCellEdit = (rowIndex: number, columnId: string, value: any) => {
    setEditingCell({ rowIndex, columnId });
    setUpdatedValues((prev) => ({
      ...prev,
      [`${rowIndex}-${columnId}`]: value,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    rowIndex: number,
    columnId: string
  ) => {
    const { value } = e.target;
    console.log("value", value);
    setUpdatedValues((prev) => ({
      ...prev,
      [`${rowIndex}-${columnId}`]: value,
    }));
  };

  // Handle saving the updated value
  const handleSave = (rowIndex: number, columnId: string) => {
    console.log("[handleSave]", rowIndex, columnId);
    // Update the data with the new value
    const key = `${rowIndex}-${columnId}`;
    if (updatedValues[key] === undefined) {
      console.log("No changes detected");
      return;
    }

    console.log("[updatedValues]", updatedValues);

    const updatedRow = {
      ...data[rowIndex],
      [columnId]: updatedValues[`${rowIndex}-${columnId}`],
    };

    // Update the data array with the modified row
    const updatedData = [...data];
    updatedData[rowIndex] = updatedRow;

    setData(updatedData); // Update the table data
    //setEditableRowId(null); // Exit edit mode for the row
    setUpdatedValues({}); // Clear the updated values
    console.log("updatedData", updatedData);
  };

  const handleCancel = () => {
    setEditingCell(null);
  };

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
      const colWidths = colRefs.current.map((col) => {
        const width = col.getBoundingClientRect().width;
        if (isNaN(width)) {
          console.error("Invalid width detected:", col);
        }
        return width;
      });
      const cumulativeWidths = colWidths.reduce(
        (acc, width) => {
          if (isNaN(width)) {
            console.error("Invalid width in cumulative calculation:", width);
            return acc;
          }
          return [...acc, acc[acc.length - 1] + width];
        },
        [0]
      );
      setCumulativeWidths(cumulativeWidths);
      console.log("cumulativeWidths", cumulativeWidths);
    }
  }, [frozenColumnCount, colRefs]); // Only run when frozen column count or refs change
  //[table.getRowModel().rows]); // Recalculate when rows change

  useEffect(() => {
    console.log("is Editing", isEditing);
    console.log("editableRowId", editableRowId);
    // setEditableRowId(initialEditableRowId);
    // setIsEditing(initialIsEditing);
  }, [isEditing, editableRowId]);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

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
                      className={cn("px-2 border border-gray-300 ", {
                        [`sticky left-0 bg-gray-100 z-${10 - index}`]:
                          index < frozenColumnCount, // Sticky columns
                        "left-0": index >= frozenColumnCount, // Default position for other columns
                      })}
                      style={
                        index < frozenColumnCount
                          ? { left: `${cumulativeWidths[index] || 0}px` }
                          : undefined
                      }
                    >
                      {(() => {
                        if (cell.column.id === "rowNumber") {
                          // Display the row number, considering pagination
                          return (
                            <span className="w-1/12">
                              {rowIndex + 1 + pageSize * pageIndex}
                            </span>
                          );
                        }

                        if (cell.column.id === "_additionalKolomAksi") {
                          // Always render the "aksi" column with flexRender
                          if (isEditing && editableRowId !== row.id) {
                            return null;
                          }
                          return flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          );
                        }

                        // Check if the cell is editable
                        if (
                          cell.column.columnDef.meta?.isCellEditable === false
                        ) {
                          return (
                            <div className="">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </div>
                          );
                        }

                        if (isEditing && editableRowId === row.id) {
                          // If in edit mode, render an editable input
                          console.log(
                            "cell.column.columnDef.meta",
                            cell.column.columnDef.meta
                          );
                          if (
                            cell.column.columnDef.meta?.inputType === "select"
                          ) {
                            if (!field) {
                              // If field is undefined, return null to avoid errors
                              return null;
                            }
                            console.log("field", field);
                            return (
                              <select
                                value={
                                  updatedValues[
                                    `${rowIndex}-${cell.column.id}`
                                  ] !== undefined
                                    ? updatedValues[
                                        `${rowIndex}-${cell.column.id}`
                                      ]
                                    : String(fieldValue || "")
                                }
                                onChange={(e) => {
                                  handleChange(e, rowIndex, cell.column.id);
                                  handleChange(e, rowIndex, field);
                                  //console.log("e", e);
                                }}
                                onBlur={() => {
                                  handleSave(rowIndex, cell.column.id);
                                  handleSave(rowIndex, field);
                                }} // Use field here
                                // autoFocus
                                className="p-2 flex w-full"
                                // style={{
                                //   width: (() => {
                                //     const nextWidth =
                                //       cumulativeWidths[index + 1];
                                //     const currentWidth =
                                //       cumulativeWidths[index] || 0;
                                //     if (
                                //       isNaN(nextWidth) ||
                                //       isNaN(currentWidth)
                                //     ) {
                                //       console.error(
                                //         `Invalid width calculation on select: nextWidth=${nextWidth}, currentWidth=${currentWidth}`
                                //       );
                                //       return 0; // Provide a default value to avoid NaN
                                //     }
                                //     return nextWidth - currentWidth;
                                //   })(),
                                // }} // Set the width to match the column width
                              >
                                {cell.column.columnDef.meta?.options?.map(
                                  (option) => (
                                    <option
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </option>
                                  )
                                )}
                              </select>
                            );
                          }

                          return (
                            <input
                              type="text"
                              value={
                                updatedValues[
                                  `${rowIndex}-${cell.column.id}`
                                ] !== undefined
                                  ? updatedValues[
                                      `${rowIndex}-${cell.column.id}`
                                    ]
                                  : String(cell.getValue() || "")
                              }
                              onChange={(e) =>
                                handleChange(e, rowIndex, cell.column.id)
                              }
                              onBlur={() =>
                                handleSave(rowIndex, cell.column.id)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  handleSave(rowIndex, cell.column.id);
                                if (e.key === "Escape") handleCancel();
                              }}
                              // autoFocus
                              className="px-2 py-1 border border-blue-700 w-auto w-full flex-wrap text-wrap"
                            />
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

export const KolomAksiDelete = <T,>(
  info: CellContext<T, unknown>,
  onDelete?: (row: T) => void
) => {
  const handleOnClickDelete = () => {
    console.log("Delete clicked");
    onDelete && onDelete(info.row.original);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleOnClickDelete}
      className=""
    >
      <Trash size={20} />
    </Button>
  );
};

export const KolomAksi = <T,>(
  info: CellContext<T, unknown>,
  onEdit?: (row: Row<T>) => void,
  onDelete?: (row: T) => void,
  onSave?: (row: T) => void,
  onUndo?: (row: T) => void,
  isEditing?: boolean
) => {
  const [oldRow, setOldRow] = useState<T>(info.row.original);

  const handleOnClickEdit = () => {
    console.log("Edit clicked");
    onEdit && onEdit(info.row);
  };

  const handleOnClickSave = () => {
    console.log("Save clicked");
    onSave && onSave(info.row.original);
  };

  const handleOnClickDelete = () => {
    console.log("Delete clicked");
    onDelete && onDelete(info.row.original);
  };

  const handleOnClickUndo = () => {
    onUndo && onUndo(oldRow);
    console.log("Undo clicked");
  };

  return (
    <>
      {isEditing && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white"
            onClick={handleOnClickSave}
          >
            <Save size={20} />
          </Button>
          <Button
            variant="outline"
            size={"sm"}
            className="bg-green-600 hover:bg-green-700 text-white hover:text-white"
            onClick={handleOnClickUndo}
          >
            <Undo2 size={20} />
          </Button>
        </div>
      )}
      {!isEditing && (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleOnClickEdit}>
            <Pencil size={20} />
          </Button>
          <Button variant="secondary" size="sm" onClick={handleOnClickDelete}>
            <Trash2 size={20} />
          </Button>
        </div>
      )}
    </>
  );
};

const validCurrencyCodes = new Set([
  "USD",
  "EUR",
  "IDR",
  // Add other valid ISO 4217 currency codes as needed
]);

export const formatCurrency = <T,>(
  info: CellContext<T, unknown>,
  currency?: string
) => {
  const value = info.getValue() as number;

  // Use default currency if not provided or invalid
  const defaultCurrency = "IDR";
  if (!currency || !validCurrencyCodes.has(currency)) {
    currency = defaultCurrency;
  }
  // Format the value as currency
  const formattedValue = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency,
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
