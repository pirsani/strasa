"use client";

import StatusBadge from "@/components/kegiatan/status-badge";
import { TabelGenericWithoutInlineEdit } from "@/components/tabel-generic-without-inline-edit";
import { RiwayatPengajuanIncludePengguna } from "@/data/kegiatan/riwayat-pengajuan";
import { JENIS_PENGAJUAN, STATUS_PENGAJUAN } from "@/lib/constants";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

const getLinkToDetail = (
  jenisPengajuan: string | JENIS_PENGAJUAN,
  riwayatPengajuanId: string
) => {
  let linkto = "";
  switch (jenisPengajuan) {
    case "GENERATE_RAMPUNGAN":
      linkto = `/pengajuan/rampungan/${riwayatPengajuanId}`;
      break;
    case "HONORARIUM":
      linkto = `/pengajuan/honorarium/${riwayatPengajuanId}`;
      break;
    case "UH_LUAR_NEGERI":
      linkto = `/pengajuan/uh-luar-negeri/${riwayatPengajuanId}`;
      break;
    case "UH_DALAM_NEGERI":
      linkto = `/pengajuan/uh-dalam-negeri/${riwayatPengajuanId}`;
      break;
    default:
      linkto = `/pengajuan/honorarium/${riwayatPengajuanId}`;
  }
  return linkto;
};

interface TabelRiwayatPengajuanProps {
  data: RiwayatPengajuanIncludePengguna[] | null;
  filterStatus?: STATUS_PENGAJUAN | null;
}
export const TabelRiwayatPengajuan = ({
  data,
  filterStatus,
}: TabelRiwayatPengajuanProps) => {
  const columns: ColumnDef<RiwayatPengajuanIncludePengguna>[] = [
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
      id: "jenis",
      header: "Jenis Pengajuan",
      accessorKey: "jenis",
      cell: (info) => {
        const linkTo = getLinkToDetail(
          info.row.original.jenis,
          info.row.original.id
        );

        return (
          <Link href={linkTo} className="hover:text-blue-500 hover:underline">
            {info.row.original.jenis}
          </Link>
        );
      },
    },
    {
      id: "kegiatan.nama",
      header: "Kegiatan",
      accessorKey: "kegiatan.nama",
    },
    {
      id: "status",
      header: "status",
      accessorKey: "status",
      cell: (info) => {
        return <StatusBadge status={info.getValue() as STATUS_PENGAJUAN} />;
      },
    },
    {
      id: "diajukanOleh",
      header: "Operator",
      accessorKey: "diajukanOleh.name",
      cell: (info) => info.getValue(),
    },
  ];

  return (
    <div>
      {data && data.length > 0 && (
        <TabelGenericWithoutInlineEdit data={data} columns={columns} />
      )}
    </div>
  );
};

export default TabelRiwayatPengajuan;
