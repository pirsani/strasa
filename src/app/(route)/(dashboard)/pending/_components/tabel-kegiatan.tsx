"use client";

import { KegiatanIncludeSatker } from "@/actions/kegiatan";
import StatusBadge from "@/components/kegiatan/status-badge";
import {
  ExpandedState,
  RowDetails,
  TabelExpandable,
} from "@/components/tabel-expandable";
import { Button } from "@/components/ui/button";
import { RiwayatPengajuanIncludePengguna } from "@/data/kegiatan/riwayat-pengajuan";
import { cn } from "@/lib/utils";
import { formatTanggal } from "@/utils/date-format";
import {
  JENIS_PENGAJUAN,
  Kegiatan,
  STATUS_PENGAJUAN,
} from "@prisma-honorarium/client";

import { useSearchTerm } from "@/hooks/use-search-term";
import { ColumnDef, Row } from "@tanstack/react-table";
import { ChevronRight, Eye } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DialogUnggahDokumen } from "./dialog-unggah-dokumen";
import DialogVerifikasiDokumenAkhir from "./dialog-verifikasi-dokumen-akhir";

interface TabelKegiatanProps {
  data: KegiatanIncludeSatker[];
  riwayatPengajuan: RiwayatPengajuanIncludePengguna[];
}
export const TabelKegiatan = ({
  data: initialData,
  riwayatPengajuan,
}: TabelKegiatanProps) => {
  const [data, setData] = useState<KegiatanIncludeSatker[]>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRowId, setEditableRowIndex] = useState<string | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [rowDetails, setRowDetails] = useState<RowDetails<RowDetail>>({});

  const { searchTerm } = useSearchTerm();
  const filteredData = data.filter((row) => {
    if (!searchTerm || searchTerm === "") return true;
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    //const searchWords = lowercasedSearchTerm.split(" ").filter(Boolean);
    const searchWords =
      lowercasedSearchTerm
        .match(/"[^"]+"|\S+/g)
        ?.map((word) => word.replace(/"/g, "")) || [];

    return searchWords.every(
      (word) =>
        row.nama?.toLowerCase().includes(word) ||
        row.unitKerja.nama?.toLowerCase().includes(word) ||
        row.unitKerja.singkatan?.toLowerCase().includes(word) ||
        row.satker.nama?.toLowerCase().includes(word) ||
        row.satker.singkatan?.toLowerCase().includes(word) ||
        row.lokasi?.toLowerCase().includes(word) ||
        row.keterangan?.toLowerCase().includes(word)
    );
  });

  const columns: ColumnDef<KegiatanIncludeSatker>[] = [
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
          <Button
            variant={"ghost"}
            onClick={() => {
              //console.log("info", info);
              handleExpand(info.row.original.id, info.row.index);
            }}
          >
            <ChevronRight
              size={18}
              className={cn(expanded[info.row.index] && "rotate-90")}
            />
          </Button>
        );
      },
      footer: "Kode",
      meta: {
        className: "w-[50px]",
      },
    },
    // {
    //   accessorKey: "unitKerja.singkatan",
    //   header: "Unit Kerja",
    //   cell: (info) => info.getValue(),
    //   footer: "Kode",
    // },
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
      accessorKey: "nama",
      header: "Nama Kegiatan",
      cell: (info) => info.getValue(),
      footer: "Nama",
    },
    {
      accessorKey: "tanggalMulai",
      header: "Mulai",
      cell: (info) => {
        return formatTanggal(info.getValue() as Date, "dd-M-yyyy");
      },
      footer: "Mulai",
    },
    {
      accessorKey: "tanggalSelesai",
      header: "Selesai",
      cell: (info) => {
        return formatTanggal(info.getValue() as Date, "dd-M-yyyy");
      },
      footer: "Selesai",
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
    keterangan?: string;
    jadwalId?: string | null;
    tanggalKegiatan?: Date | string | null;
    pengajuanId?: string | null;
    jenisPengajuan?: JENIS_PENGAJUAN | null;
    statusPengajuan?: STATUS_PENGAJUAN | null;
    diajukanOlehId?: string | null;
    diajukanOleh?: string | null;
    diajukanTanggal?: Date | string | null;
    diverifikasiTanggal?: Date | string | null;
    disetujuiTanggal?: Date | string | null;
    dibayarTanggal?: Date | string | null;
    hasDokumentasi?: boolean;
    hasLaporan?: boolean;
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

  const handleViewRiwayatPengajuan =
    (kegiatanId: string, detail: RowDetail) => () => {
      console.log("View detail:", detail);
      // Implement your view logic here
      // view pdf

      //
      if (!detail.jenisPengajuan || !detail.statusPengajuan) return;
      switch (detail.jenisPengajuan) {
        case JENIS_PENGAJUAN.GENERATE_RAMPUNGAN:
          window.open(`/download/dokumen-rampungan/${kegiatanId}`, "_blank");
          return;
        case JENIS_PENGAJUAN.HONORARIUM:
          if (detail.statusPengajuan === STATUS_PENGAJUAN.PAID) {
            window.open(
              `/download/bukti-pembayaran/${detail.pengajuanId}`,
              "_blank"
            );
            return;
          }
          window.open(
            `/download/nominatif-honorarium/${kegiatanId}/${detail.jadwalId}`,
            "_blank"
          );
          return;
        case JENIS_PENGAJUAN.UH_DALAM_NEGERI:
          if (detail.statusPengajuan === STATUS_PENGAJUAN.PAID) {
            window.open(
              `/download/bukti-pembayaran/${detail.pengajuanId}`,
              "_blank"
            );
            return;
          }
          window.open(
            `/download/nominatif-uh-dalam-negeri/${kegiatanId}/${detail.id}`,
            "_blank"
          );
          return;
        case JENIS_PENGAJUAN.UH_LUAR_NEGERI:
          if (detail.statusPengajuan === STATUS_PENGAJUAN.PAID) {
            window.open(
              `/download/bukti-pembayaran/${detail.pengajuanId}`,
              "_blank"
            );
            return;
          }
          window.open(
            `/download/nominatif-uh-luar-negeri/${kegiatanId}/${detail.id}`,
            "_blank"
          );
          return;
      }
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

    setExpanded((prev) => ({
      ...prev,
      [index]: !prev[index], // Allow multiple rows to be expanded
    }));
    setIsExpanded(!isExpanded);
  };

  const handleDokumenAkhirSubmitted = (
    kegiatanId: string,
    riwayatPengajuanId: string
  ) => {
    // find data that have have the same kegiatanId
    const details = rowDetails[kegiatanId];
    // find the detail that have the same riwayatPengajuanId
    const detail = details?.find((d) => d.id === riwayatPengajuanId);
    if (!detail) {
      console.error("Detail not found");
      return;
    } else {
      //update details
      detail.hasDokumentasi = true;
      detail.hasLaporan = true;
      // update rowDetails
      setRowDetails((prev) => {
        return {
          ...prev,
          [kegiatanId]: details,
        };
      });
    }
  };

  const handleVerifikasiDokumenAkhirSubmitted = (
    kegiatanId: string,
    riwayatPengajuanId: string
  ) => {
    // find data that have have the same kegiatanId
    const details = rowDetails[kegiatanId];
    // find the detail that have the same riwayatPengajuanId
    const detail = details?.find((d) => d.id === riwayatPengajuanId);
    if (!detail) {
      console.error("Detail not found");
      return;
    } else {
      //update details
      detail.statusPengajuan = "END";
      // update rowDetails
      setRowDetails((prev) => {
        return {
          ...prev,
          [kegiatanId]: details,
        };
      });
    }
  };

  interface LinkToDokumenAkhirProps {
    hasDokumenAkhir: boolean;
    jenisDokumenAkhir: string;
    riwayatPengajuanId: string;
  }
  const LinkToDokumenAkhir = ({
    hasDokumenAkhir,
    jenisDokumenAkhir,
    riwayatPengajuanId,
  }: LinkToDokumenAkhirProps) => {
    if (!hasDokumenAkhir) {
      return null;
    }
    switch (jenisDokumenAkhir) {
      case "dokumentasi":
      case "laporan":
        return (
          <Link
            href={`/download/dokumen-akhir/${jenisDokumenAkhir}/${riwayatPengajuanId}`}
            target="_blank"
          >
            <Button variant="outline" size="sm">
              <Eye size={18} />
            </Button>
          </Link>
        );

      default:
        return null;
    }
  };

  const renderExpandedRowDetails = (
    row: KegiatanIncludeSatker
    //details: RowDetail[]
  ) => {
    const details = rowDetails[row.id];

    if (details && details.length > 0) {
      // iterate over details
      return (
        <tr>
          <td colSpan={8} className=" pb-4">
            <table className="table-auto w-full text-left border border-collapse">
              <thead className="w-full">
                <tr className="bg-gray-400 text-white h-12 w-full">
                  <th className="border px-1 w-1/5">Keterangan/Kelas</th>
                  <th className="border px-1">Tanggal Pengajuan</th>
                  <th className="border px-1 w-1/6">Jenis Pengajuan</th>
                  <th className="border px-1">Status Pengajuan</th>
                  <th className="border px-1">Dokumentasi</th>
                  <th className="border px-1">Laporan Kegiatan</th>
                  <th> Aksi </th>
                </tr>
              </thead>
              <tbody>
                {details.map((detail: RowDetail) => (
                  <tr key={detail.id} className="even:bg-slate-100 h-10">
                    <td className="border px-2">{detail.keterangan}</td>
                    <td className="border px-2">
                      {formatTanggal(detail.diajukanTanggal, "dd-M-yyyy")}
                    </td>
                    <td className="border px-2">{detail.jenisPengajuan}</td>
                    <td className="border px-2">
                      {<StatusBadge status={detail.statusPengajuan ?? null} />}
                    </td>
                    <td className="border px-2">
                      <LinkToDokumenAkhir
                        hasDokumenAkhir={detail.hasDokumentasi ?? false}
                        jenisDokumenAkhir="dokumentasi"
                        riwayatPengajuanId={detail.id}
                      />
                    </td>
                    <td className="border px-2">
                      <LinkToDokumenAkhir
                        hasDokumenAkhir={detail.hasDokumentasi ?? false}
                        jenisDokumenAkhir="dokumentasi"
                        riwayatPengajuanId={detail.id}
                      />
                    </td>
                    <td>
                      <div className="flex flex-auto gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleViewRiwayatPengajuan(row.id, detail)}
                        >
                          <Eye size={18} />
                        </Button>
                        {(!detail.hasDokumentasi || !detail.hasLaporan) && (
                          <DialogUnggahDokumen
                            kegiatanId={row.id}
                            riwayatPengajuanId={detail.id}
                            onSubmitted={handleDokumenAkhirSubmitted}
                          />
                        )}
                        {detail.hasDokumentasi &&
                          detail.hasLaporan &&
                          detail.statusPengajuan === "PAID" && (
                            <DialogVerifikasiDokumenAkhir
                              kegiatanId={row.id}
                              riwayatPengajuanId={detail.id}
                              onSubmitted={
                                handleVerifikasiDokumenAkhirSubmitted
                              }
                            />
                          )}
                      </div>
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

  const renderExpandedRow = (row: KegiatanIncludeSatker) => {
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

  const mapsDataToRowDetails = (data: RiwayatPengajuanIncludePengguna[]) => {
    let rowDetails: RowDetails<RowDetail> = {};
    data.forEach((item) => {
      const rowDetail: RowDetail = {
        id: item.id,
        keterangan: item.keterangan,
        jadwalId: item.jadwal?.id,
        tanggalKegiatan: item.jadwal?.tanggal,
        pengajuanId: item.id,
        jenisPengajuan: item.jenis,
        statusPengajuan: item.status,
        diajukanOlehId: item.diajukanOleh.id,
        diajukanOleh: item.diajukanOleh.name,
        diajukanTanggal: item.diajukanTanggal,
        diverifikasiTanggal: item.diverifikasiTanggal,
        disetujuiTanggal: item.disetujuiTanggal,
        dibayarTanggal: item.dibayarTanggal,
        hasDokumentasi: !!item.dokumentasi,
        hasLaporan: !!item.dokumenLaporanKegiatan,
      };
      rowDetails[item.kegiatanId] = [rowDetail];
    });
    return rowDetails;
  };

  useEffect(() => {
    setData(initialData);
    // reset expanded state
    setExpanded({});
    const rowDetails = mapsDataToRowDetails(riwayatPengajuan);
    setRowDetails(rowDetails);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, riwayatPengajuan]);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <TabelExpandable
        data={filteredData}
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
