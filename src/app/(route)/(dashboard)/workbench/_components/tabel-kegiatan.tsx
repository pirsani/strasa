"use client";

import { KegiatanWithSatker } from "@/actions/kegiatan";
import {
  ExpandedState,
  RowDetails,
  TabelExpandable,
} from "@/components/tabel-expandable";
import { Button } from "@/components/ui/button";
import { Kegiatan } from "@prisma-honorarium/client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { ChevronRight, Eye } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface TabelKegiatanProps {
  data: KegiatanWithSatker[];
}
export const TabelKegiatan = ({ data: initialData }: TabelKegiatanProps) => {
  const [data, setData] = useState<KegiatanWithSatker[]>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRowId, setEditableRowIndex] = useState<string | null>(null);
  const columns: ColumnDef<KegiatanWithSatker>[] = [
    {
      id: "rowNumber",
      header: "#",
      // cell: (info) => info.row.index + 1, // Display row number (1-based index)
      footer: "#",
      meta: {
        className: "w-[50px]",
      },
    },
    {
      accessorKey: "id",
      header: "",
      cell: (info) => {
        return (
          <Button variant={"ghost"}>
            <ChevronRight
              size={18}
              onClick={() => {
                console.log("info", info);
                handleExpand(info.row.id);
              }}
            />
          </Button>
        );
      },
      footer: "Kode",
      meta: {
        className: "w-[50px]",
      },
    },
    {
      accessorKey: "unitKerja.singkatan",
      header: "Unit Kerja",
      cell: (info) => info.getValue(),
      footer: "Kode",
    },
    {
      //accessorKey: "kode",
      header: "Tanggal Pengajuan",
      //cell: (info) => info.getValue(),
      footer: "Kode",
      meta: {
        showOnExpand: true,
      },
    },
    {
      //accessorKey: "kode",
      header: "Jenis Pengajuan",
      //cell: (info) => info.getValue(),
      footer: "Kode",
      meta: {
        showOnExpand: true,
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => info.getValue(),
      footer: "Status",
    },

    {
      accessorKey: "nama",
      header: "Nama Kegiatan",
      cell: (info) => info.getValue(),
      footer: "Nama",
    },
    {
      //accessorKey: "kode",
      id: "aksi",
      header: "",
      cell: (info) => {
        return (
          <Link href={`/kegiatan/${info.row.original.id}`}>
            <Button variant="outline" size="sm">
              <Eye size={18} />
            </Button>
          </Link>
        );
      },
      //cell: (info) => info.getValue(),
      //footer: "Kode",
    },
  ];

  interface RowDetail {
    id: string;
    nama: string;
    createdAt: Date;
  }

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [rowDetails, setRowDetails] = useState<RowDetails<RowDetail>>({});

  const handleView = (row: Kegiatan) => {
    console.log("View row:", row);
    // Implement your view logic here
    // view pdf
  };

  const handleEdit = (row: Row<Kegiatan>) => {
    console.log("Edit row:", row);
    // to new page
  };

  const handleExpand = (rowId: string) => {
    console.log("Expand row:", rowId);
    // Implement your expand row logic here
    setExpanded((prev) => ({
      ...prev,
      [rowId]: !prev[rowId], // Allow multiple rows to be expanded
    }));
    setIsExpanded(!isExpanded);
  };

  const renderExpandedRowDetails = (
    row: KegiatanWithSatker,
    details: RowDetail[]
  ) => {
    if (!details || details.length === 0) {
      return (
        <tr>
          <td colSpan={8}>
            <p>No details available</p>
          </td>
        </tr>
      );
    }

    return (
      <div>
        <p>
          <strong>Details:</strong>
        </p>
      </div>
    );
  };

  const renderExpandedRow = (row: KegiatanWithSatker) => {
    console.log("Expanded row:", row);
    return (
      <tr>
        <td></td>
        <td></td>
        <td>{row.nama}</td>
        <td>{row.createdAt.toISOString().substring(0, 10)}</td>
        {/* Add more details as needed */}
      </tr>
    );
  };

  useEffect(() => {
    setData(initialData);
  }, [initialData]);
  return (
    <div>
      <TabelExpandable
        data={data}
        columns={columns}
        renderExpandedRowDetails={renderExpandedRowDetails}
        expanded={expanded}
        setExpanded={setExpanded}
        rowDetails={rowDetails}
      />
    </div>
  );
};

export default TabelKegiatan;
