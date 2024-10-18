"use client";

import { KegiatanWithSatker } from "@/actions/kegiatan";
import StatusBadge from "@/components/kegiatan/status-badge";
import {
  ExpandedState,
  RowDetails,
  TabelExpandable,
} from "@/components/tabel-expandable";
import { Button } from "@/components/ui/button";
import { getObPlainJadwalByKegiatanId } from "@/data/jadwal";
import { getRiwayatPengajuanByKegiatanIdAndJenisPengajuan } from "@/data/kegiatan/riwayat-pengajuan";
import { formatHariTanggal, formatTanggal } from "@/utils/date-format";
import {
  JENIS_PENGAJUAN,
  Kegiatan,
  STATUS_PENGAJUAN,
} from "@prisma-honorarium/client";

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
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [rowDetails, setRowDetails] = useState<RowDetails<RowDetail>>({});

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
              //className={cn(expanded[info.row.index] && "rotate-90")}
              onClick={() => {
                //console.log("info", info);
                handleExpand(info.row.original.id, info.row.index);
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
    // {
    //   //accessorKey: "kode",
    //   header: "Tanggal Pengajuan",
    //   //cell: (info) => info.getValue(),
    //   footer: "Kode",
    //   meta: {
    //     showOnExpand: true,
    //   },
    // },
    // {
    //   //accessorKey: "kode",
    //   header: "Jenis Pengajuan",
    //   //cell: (info) => info.getValue(),
    //   footer: "Kode",
    //   meta: {
    //     showOnExpand: true,
    //   },
    // },
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
    tanggalKegiatan?: Date | string | null;
    jenisPengajuan?: JENIS_PENGAJUAN | null;
    statusPengajuan?: STATUS_PENGAJUAN | null;
    diajukanOlehId?: string | null;
    diajukanOleh?: string | null;
    diajukanTanggal?: Date | string | null;
    diverifikasiTanggal?: Date | string | null;
    disetujuiTanggal?: Date | string | null;
    dibayarTanggal?: Date | string | null;
  }

  const handleView = (row: Kegiatan) => {
    console.log("View row:", row);
    // Implement your view logic here
    // view pdf
  };

  const handleEdit = (row: Row<Kegiatan>) => {
    console.log("Edit row:", row);
    // to new page
  };

  const handleExpand = async (rowId: string, index: number) => {
    // console.log("Expand row:", rowId);
    // check if already fetched or Check if the row is already expanded just close it
    if (rowDetails[rowId] || expanded[index]) {
      console.info("Row already expanded");
      setExpanded((prev) => ({
        ...prev,
        [index]: !prev[index], // Allow multiple rows to be expanded
      }));
      return;
    }

    let newDetails: RowDetail[] = [];

    const riwayatRampungan =
      await getRiwayatPengajuanByKegiatanIdAndJenisPengajuan(
        rowId,
        JENIS_PENGAJUAN.GENERATE_RAMPUNGAN
      );

    if (riwayatRampungan) {
      const newRiwayatRampungan: RowDetail = {
        id: riwayatRampungan.id,
        nama: "Rampungan",
        jenisPengajuan: riwayatRampungan.jenis,
        statusPengajuan: riwayatRampungan.status,
        diajukanOlehId: riwayatRampungan.diajukanOlehId,
        diajukanOleh: riwayatRampungan.diajukanOleh.name,
        diajukanTanggal: riwayatRampungan.diajukanTanggal,
        diverifikasiTanggal: riwayatRampungan.diverifikasiTanggal,
        disetujuiTanggal: riwayatRampungan.disetujuiTanggal,
        dibayarTanggal: riwayatRampungan.dibayarTanggal,
      };
      newDetails.push(newRiwayatRampungan);
    }

    const riwayatPengajuanUhLuarNegeri =
      await getRiwayatPengajuanByKegiatanIdAndJenisPengajuan(
        rowId,
        JENIS_PENGAJUAN.UH_DALAM_NEGERI
      );

    if (riwayatPengajuanUhLuarNegeri) {
      const newRiwayatPengajuanUhLuarNegeri: RowDetail = {
        id: riwayatPengajuanUhLuarNegeri.id,
        nama: "Uang Harian Luar Negeri",
        jenisPengajuan: riwayatPengajuanUhLuarNegeri.jenis,
        statusPengajuan: riwayatPengajuanUhLuarNegeri.status,
        diajukanOlehId: riwayatPengajuanUhLuarNegeri.diajukanOlehId,
        diajukanOleh: riwayatPengajuanUhLuarNegeri.diajukanOleh.name,
        diajukanTanggal: riwayatPengajuanUhLuarNegeri.diajukanTanggal,
        diverifikasiTanggal: riwayatPengajuanUhLuarNegeri.diverifikasiTanggal,
        disetujuiTanggal: riwayatPengajuanUhLuarNegeri.disetujuiTanggal,
        dibayarTanggal: riwayatPengajuanUhLuarNegeri.dibayarTanggal,
      };
      newDetails.push(newRiwayatPengajuanUhLuarNegeri);
    }

    const riwayatPengajuanUhDalamNegeri =
      await getRiwayatPengajuanByKegiatanIdAndJenisPengajuan(
        rowId,
        JENIS_PENGAJUAN.UH_LUAR_NEGERI
      );

    if (riwayatPengajuanUhDalamNegeri) {
      const newRiwayatPengajuanUhDalamNegeri: RowDetail = {
        id: riwayatPengajuanUhDalamNegeri.id,
        nama: "Uang Harian Dalam Negeri",
        jenisPengajuan: riwayatPengajuanUhDalamNegeri.jenis,
        statusPengajuan: riwayatPengajuanUhDalamNegeri.status,
        diajukanOlehId: riwayatPengajuanUhDalamNegeri.diajukanOlehId,
        diajukanOleh: riwayatPengajuanUhDalamNegeri.diajukanOleh.name,
        diajukanTanggal: riwayatPengajuanUhDalamNegeri.diajukanTanggal,
        diverifikasiTanggal: riwayatPengajuanUhDalamNegeri.diverifikasiTanggal,
        disetujuiTanggal: riwayatPengajuanUhDalamNegeri.disetujuiTanggal,
        dibayarTanggal: riwayatPengajuanUhDalamNegeri.dibayarTanggal,
      };
      newDetails.push(newRiwayatPengajuanUhDalamNegeri);
    }

    const jadwals = await getObPlainJadwalByKegiatanId(rowId);
    //console.log("Detail:", detail);

    const newDetailsJadwal: RowDetail[] = jadwals.map((jadwal) => {
      return {
        id: jadwal.id,
        nama: jadwal.kelas.nama,
        tanggalKegiatan: jadwal.tanggal,
        jenisPengajuan: jadwal.riwayatPengajuan?.jenis,
        // statusPengajuan: mapStatusLangkahToDesc(
        //   jadwal.statusPengajuanHonorarium
        // ),
        statusPengajuan: jadwal.riwayatPengajuan?.status || null,
        diajukanOlehId: jadwal.riwayatPengajuan?.diajukanOlehId,
        diajukanOleh: jadwal.riwayatPengajuan?.diajukanOleh?.name,
        diajukanTanggal: jadwal.riwayatPengajuan?.diajukanTanggal,
        diverifikasiTanggal: jadwal.riwayatPengajuan?.diajukanTanggal,
        disetujuiTanggal: jadwal.riwayatPengajuan?.disetujuiTanggal,
        dibayarTanggal: jadwal.riwayatPengajuan?.dibayarTanggal,
      };
    });

    newDetails.push(...newDetailsJadwal);

    const newRowDetails = {
      ...rowDetails,
      [rowId]: newDetails,
    };

    setRowDetails(newRowDetails);

    setExpanded((prev) => ({
      ...prev,
      [index]: !prev[index], // Allow multiple rows to be expanded
    }));
    setIsExpanded(!isExpanded);
  };

  const renderExpandedRowDetails = (
    row: KegiatanWithSatker
    //details: RowDetail[]
  ) => {
    const details = rowDetails[row.id];

    if (details && details.length > 0) {
      // iterate over details
      return (
        <tr>
          <td colSpan={8} className=" pb-4">
            <table className="table-auto w-full text-left border border-collapse">
              <thead>
                <tr className="bg-gray-800 text-gray-200 h-12">
                  <th className="border px-1">Keterangan/Kelas</th>
                  <th className="border px-1">Tanggal Kegiatan</th>
                  <th className="border px-1">Tanggal Pengajuan</th>
                  <th className="border px-1">Jenis Pengajuan</th>
                  <th className="border px-1">Status Pengajuan</th>
                  <th className="border px-1">Operator</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {details.map((detail: RowDetail) => (
                  <tr key={detail.id} className="even:bg-slate-100 h-10">
                    <td className="border px-2">{detail.nama}</td>
                    <td className="border px-2">
                      {formatHariTanggal(detail.tanggalKegiatan)}
                    </td>
                    <td className="border px-2">
                      {formatTanggal(detail.diajukanTanggal)}
                    </td>
                    <td className="border px-2">{detail.jenisPengajuan}</td>
                    <td className="border px-2">
                      {<StatusBadge status={detail.statusPengajuan ?? null} />}
                    </td>
                    <td className="border px-2">{detail.diajukanOleh}</td>
                    <td>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-800"
                      >
                        <Eye size={18} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      );
    } else {
      return (
        <tr>
          <td colSpan={8}>
            <div>
              <p>
                <strong>No Details Available</strong>
              </p>
            </div>
          </td>
        </tr>
      );
    }
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
