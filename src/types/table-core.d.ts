import { RowData } from "@tanstack/react-table";
declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData?: (rowIndex: number, columnId: string, value: string) => void;
    toggleAllBoolean?: (columnId: string, value: boolean) => void;
    changeAllOptions?: (columnId: string, value: string | number) => void;
    getIsAllTrue?: (columnId: string) => boolean;
    getIsSomeTrue?: (columnId: string) => boolean;
  }
  // <// <https://github.com/TanStack/table/discussions/5051>
  // @ts-expect-error
  interface ColumnMeta<TData extends RowData, TValue> {
    rowSpan?: number;
    isKolomAksi?: boolean;
    inputType?: "text" | "number" | "select" | "checkbox";
    options?: { value: string | number; label: string }[];
    field?: string; // Field name that need to be updated when the value option changes
    isCellEditable?: boolean;
    width?: string;
    className?: string;
    hideOnExpand?: boolean;
    showOnExpand?: boolean;
  }
}
