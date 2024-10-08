"use client";
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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface TabelGenericProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  frozenColumnCount?: number;
}

export const TabelGeneric = <T,>({
  data,
  columns,
  frozenColumnCount = 1,
}: TabelGenericProps<T>) => {
  const [pageSize, setPageSize] = useState(10); // Set the initial page size
  const [pageIndex, setPageIndex] = useState(0); // Set the initial page index
  const [sorting, setSorting] = useState<SortingState>([]); // Explicitly define SortingState

  const [stickyLeft, setStickyLeft] = useState<number>(0);
  const [cumulativeWidths, setCumulativeWidths] = useState<number[]>([]);
  const col1Ref = useRef<HTMLTableCellElement>(null);
  const col2Ref = useRef<HTMLTableCellElement>(null);
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
      console.log("cumulativeWidths", cumulativeWidths);
    }

    if (col1Ref.current && col2Ref.current) {
      const col1Width = col1Ref.current.getBoundingClientRect().width;
      const col2Width = col2Ref.current.getBoundingClientRect().width;
      setStickyLeft(col1Width);
      console.log(col1Width, col2Width);
      console.log("stickyLeft", col1Width + col2Width);
    }
  }, [frozenColumnCount, colRefs]); // Only run when frozen column count or refs change
  //[table.getRowModel().rows]); // Recalculate when rows change

  return (
    <div>
      <div className="overflow-x-auto w-full">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => (
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
                    className={cn("p-2 border border-gray-300", {
                      [`sticky left-0 bg-white z-${10 - index}`]:
                        index < frozenColumnCount, // Sticky columns
                      "left-0": index >= frozenColumnCount, // Default position for other columns
                    })}
                    style={
                      index < frozenColumnCount
                        ? { left: `${cumulativeWidths[index] || 0}px` }
                        : undefined
                    }
                    onClick={header.column.getToggleSortingHandler()} // Enable sorting on click
                  >
                    <div className="flex flex-row items-center w-full">
                      <span className="flex-grow">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </span>
                      <span className="hover:cursor-pointer">
                        {/* Default: show nothing */}
                        {(() => {
                          const sortOrder = header.column.getIsSorted();
                          if (sortOrder === false) {
                            return "↕️"; // Not sorted icon
                          }
                          return sortOrder === "asc" ? "🔼" : "🔽"; // Sort ascending or descending icon
                        })()}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="odd:bg-white even:bg-gray-50">
                {row.getVisibleCells().map((cell, index) => (
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
                    className={cn("p-2 border border-gray-300 ", {
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {/* <tfoot>
          {table.getFooterGroups().map((footerGroup) => (
            <tr key={footerGroup.id} className="even:bg-gray-50">
              {footerGroup.headers.map((header, index) => (
                <td
                  key={header.id}
                  className={`p-2 border border-gray-300 ${
                    index < frozenColumnCount ? "sticky left-0 bg-white z-10" : ""
                  } ${index === 2 ? "left-40" : "left-0"}`} // Adjust based on column width
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext()
                      )}
                </td>
              ))}
            </tr>
          ))}
        </tfoot> */}
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
    <div className="my-2 flex flex-row gap-0 sm:gap-2 items-center">
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
