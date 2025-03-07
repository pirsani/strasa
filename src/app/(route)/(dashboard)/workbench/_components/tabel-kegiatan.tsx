"use client";

import { KegiatanIncludeSatker } from "@/actions/kegiatan";
import StatusBadge from "@/components/kegiatan/status-badge";
import {
  ExpandedState,
  RowDetails,
  TabelExpandable,
} from "@/components/tabel-expandable";
import { Button } from "@/components/ui/button";
import { getObPlainJadwalByKegiatanId } from "@/data/jadwal";
import { getRiwayatPengajuanByKegiatanIdAndJenisPengajuan } from "@/data/kegiatan/riwayat-pengajuan";
import { useSearchTerm } from "@/hooks/use-search-term";
import { cn } from "@/lib/utils";
import { formatTanggal } from "@/utils/date-format";
import {
  JENIS_PENGAJUAN,
  Kegiatan,
  STATUS_PENGAJUAN,
} from "@prisma-honorarium/client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { ChevronRight, Eye } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface RowDetail {
  id: string;
  nama: string;
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
  catatanRevisi?: string | null;
}

interface TabelKegiatanProps {
  data: KegiatanIncludeSatker[];
}
export const TabelKegiatan = ({ data: initialData }: TabelKegiatanProps) => {
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
        row.lokasi?.toLowerCase().includes(word)
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
      accessorKey: "status",
      header: "Status",
      cell: (info) => info.getValue(),
      footer: "Status",
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
      // diganti dengan link to dokumen
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
        pengajuanId: riwayatRampungan.id,
        jenisPengajuan: riwayatRampungan.jenis,
        statusPengajuan: riwayatRampungan.status,
        diajukanOlehId: riwayatRampungan.diajukanOlehId,
        diajukanOleh: riwayatRampungan.diajukanOleh.name,
        diajukanTanggal: riwayatRampungan.diajukanTanggal,
        diverifikasiTanggal: riwayatRampungan.diverifikasiTanggal,
        disetujuiTanggal: riwayatRampungan.disetujuiTanggal,
        dibayarTanggal: riwayatRampungan.dibayarTanggal,
        catatanRevisi: riwayatRampungan.catatanRevisi,
      };
      newDetails.push(newRiwayatRampungan);
    }

    const riwayatPengajuanUhLuarNegeri =
      await getRiwayatPengajuanByKegiatanIdAndJenisPengajuan(
        rowId,
        JENIS_PENGAJUAN.UH_LUAR_NEGERI
      );

    if (riwayatPengajuanUhLuarNegeri) {
      const newRiwayatPengajuanUhLuarNegeri: RowDetail = {
        id: riwayatPengajuanUhLuarNegeri.id,
        nama: "Uang Harian Luar Negeri",
        pengajuanId: riwayatPengajuanUhLuarNegeri.id,
        jenisPengajuan: riwayatPengajuanUhLuarNegeri.jenis,
        statusPengajuan: riwayatPengajuanUhLuarNegeri.status,
        diajukanOlehId: riwayatPengajuanUhLuarNegeri.diajukanOlehId,
        diajukanOleh: riwayatPengajuanUhLuarNegeri.diajukanOleh.name,
        diajukanTanggal: riwayatPengajuanUhLuarNegeri.diajukanTanggal,
        diverifikasiTanggal: riwayatPengajuanUhLuarNegeri.diverifikasiTanggal,
        disetujuiTanggal: riwayatPengajuanUhLuarNegeri.disetujuiTanggal,
        dibayarTanggal: riwayatPengajuanUhLuarNegeri.dibayarTanggal,
        catatanRevisi: riwayatPengajuanUhLuarNegeri.catatanRevisi,
      };
      newDetails.push(newRiwayatPengajuanUhLuarNegeri);
    }

    const riwayatPengajuanUhDalamNegeri =
      await getRiwayatPengajuanByKegiatanIdAndJenisPengajuan(
        rowId,
        JENIS_PENGAJUAN.UH_DALAM_NEGERI
      );

    if (riwayatPengajuanUhDalamNegeri) {
      const newRiwayatPengajuanUhDalamNegeri: RowDetail = {
        id: riwayatPengajuanUhDalamNegeri.id,
        nama: "Uang Harian Dalam Negeri",
        pengajuanId: riwayatPengajuanUhDalamNegeri.id,
        jenisPengajuan: riwayatPengajuanUhDalamNegeri.jenis,
        statusPengajuan: riwayatPengajuanUhDalamNegeri.status,
        diajukanOlehId: riwayatPengajuanUhDalamNegeri.diajukanOlehId,
        diajukanOleh: riwayatPengajuanUhDalamNegeri.diajukanOleh.name,
        diajukanTanggal: riwayatPengajuanUhDalamNegeri.diajukanTanggal,
        diverifikasiTanggal: riwayatPengajuanUhDalamNegeri.diverifikasiTanggal,
        disetujuiTanggal: riwayatPengajuanUhDalamNegeri.disetujuiTanggal,
        dibayarTanggal: riwayatPengajuanUhDalamNegeri.dibayarTanggal,
        catatanRevisi: riwayatPengajuanUhDalamNegeri.catatanRevisi,
      };
      newDetails.push(newRiwayatPengajuanUhDalamNegeri);
    }

    const jadwals = await getObPlainJadwalByKegiatanId(rowId);
    //console.log("Detail:", detail);

    const newDetailsJadwal: RowDetail[] = jadwals.map((jadwal) => {
      return {
        id: jadwal.id,
        nama: jadwal.kelas.nama + "-" + jadwal.materi.nama,
        tanggalKegiatan: jadwal.tanggal,
        jenisPengajuan: jadwal.riwayatPengajuan?.jenis,
        // statusPengajuan: mapStatusLangkahToDesc(
        //   jadwal.statusPengajuanHonorarium
        // ),
        pengajuanId: jadwal.riwayatPengajuan?.id,
        statusPengajuan: jadwal.riwayatPengajuan?.status || null,
        diajukanOlehId: jadwal.riwayatPengajuan?.diajukanOlehId,
        diajukanOleh: jadwal.riwayatPengajuan?.diajukanOleh?.name,
        diajukanTanggal: jadwal.riwayatPengajuan?.diajukanTanggal,
        diverifikasiTanggal: jadwal.riwayatPengajuan?.diajukanTanggal,
        disetujuiTanggal: jadwal.riwayatPengajuan?.disetujuiTanggal,
        dibayarTanggal: jadwal.riwayatPengajuan?.dibayarTanggal,
        catatanRevisi: jadwal.riwayatPengajuan?.catatanRevisi,
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
              <thead>
                <tr className="bg-gray-400 text-white h-12">
                  <th className="border px-1">Keterangan/Kelas</th>
                  <th className="border px-1">Tanggal Pengajuan</th>
                  <th className="border px-1">Jenis Pengajuan</th>
                  <th className="border px-1">Status Pengajuan</th>
                  <th className="border px-1">Keterangan Revisi</th>
                  <th className="border px-1">Dokumen</th>
                  <th className="border px-1">Operator</th>
                </tr>
              </thead>
              <tbody>
                {details.map((detail: RowDetail) => {
                  let linkto = `/pengajuan/honorarium/${detail.id}`;

                  switch (detail.jenisPengajuan) {
                    case "GENERATE_RAMPUNGAN":
                      linkto = `/pengajuan/rampungan/${detail.id}`;
                      break;
                    case "HONORARIUM":
                      linkto = `/pengajuan/honorarium/${detail.id}`;
                      break;
                    case "UH_LUAR_NEGERI":
                      linkto = `/pengajuan/uh-luar-negeri/${detail.id}`;
                      break;
                    case "UH_DALAM_NEGERI":
                      linkto = `/pengajuan/uh-dalam-negeri/${detail.id}`;
                      break;
                    default:
                      linkto = `/pengajuan/honorarium/${detail.id}`;
                  }

                  return (
                    <tr
                      key={detail.id}
                      className="even:bg-slate-100 h-10 hover:bg-slate-200"
                    >
                      <td className="border px-2">
                        <Link href={linkto} className="text-blue-500 underline">
                          {detail.nama}
                        </Link>
                      </td>
                      {/* <td className="border px-2">
                        {formatTanggal(detail.tanggalKegiatan, "dd-M-yyyy")}
                      </td> */}
                      <td className="border px-2">
                        {formatTanggal(detail.diajukanTanggal, "dd-M-yyyy")}
                      </td>
                      <td className="border px-2">{detail.jenisPengajuan}</td>
                      <td className="border px-2">
                        {<StatusPengajuan status={detail.statusPengajuan} />}
                      </td>
                      <td className="border px-2">{detail.catatanRevisi}</td>
                      <td className="border px-2">
                        {
                          <DokumenPengajuan
                            kegiatanId={row.id}
                            rowDetail={detail}
                          />
                        }
                      </td>
                      <td className="border px-2">{detail.diajukanOleh}</td>
                    </tr>
                  );
                })}
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

  useEffect(() => {
    setData(initialData);
    // reset expanded state
    setExpanded({});
    setRowDetails({});
  }, [initialData]);

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

interface LinkToDokumenProps {
  kegiatanId: string;
  jenisDokumen: string;
  rowDetail: RowDetail;
}

interface LinkToDokumenAkhirProps {
  jenisPengajuan?: JENIS_PENGAJUAN | null;
  jenisDokumenAkhir: string;
  riwayatPengajuanId: string;
}

interface LinkToDokumensProps {
  kegiatanId: string;
  rowDetail: RowDetail;
}

// Shared button component for rendering links
const RenderLink = ({ href, label }: { href: string; label: string }) => (
  <Link href={href} target="_blank">
    <Button variant="outline" size="sm" className="gap-2">
      <span>{label}</span>
      <Eye size={18} />
    </Button>
  </Link>
);

// LinkToDokumen component
const LinkToDokumen = ({
  kegiatanId,
  jenisDokumen,
  rowDetail,
}: LinkToDokumenProps) => {
  const statusWithNominatif: STATUS_PENGAJUAN[] = [
    "REQUEST_TO_PAY",
    "PAID",
    "END",
  ];
  const statusWithBuktiPembayaran: STATUS_PENGAJUAN[] = ["PAID", "END"];

  const validationRules: Record<string, (detail: RowDetail) => boolean> = {
    "dokumen-rampungan": (detail) =>
      detail.jenisPengajuan === "GENERATE_RAMPUNGAN",
    "nominatif-honorarium": (detail) =>
      detail.jenisPengajuan === "HONORARIUM" &&
      statusWithNominatif.includes(detail.statusPengajuan ?? "DRAFT"),
    "nominatif-uh-dalam-negeri": (detail) =>
      detail.jenisPengajuan === "UH_DALAM_NEGERI" &&
      statusWithNominatif.includes(detail.statusPengajuan ?? "DRAFT"),
    "nominatif-uh-luar-negeri": (detail) =>
      detail.jenisPengajuan === "UH_LUAR_NEGERI" &&
      statusWithNominatif.includes(detail.statusPengajuan ?? "DRAFT"),
    "bukti-pembayaran": (detail) =>
      statusWithBuktiPembayaran.includes(detail.statusPengajuan ?? "DRAFT") &&
      detail.jenisPengajuan !== "GENERATE_RAMPUNGAN",
  };

  const linkPaths: Record<string, string> = {
    "dokumen-rampungan": `/download/dokumen-rampungan/${kegiatanId}`,
    "nominatif-honorarium": `/download/${jenisDokumen}/${kegiatanId}/${rowDetail.id}`, // id disini adalah jadwal id
    "nominatif-uh-dalam-negeri": `/download/${jenisDokumen}/${kegiatanId}/${rowDetail.pengajuanId}`,
    "nominatif-uh-luar-negeri": `/download/${jenisDokumen}/${kegiatanId}/${rowDetail.pengajuanId}`,
    "bukti-pembayaran": `/download/bukti-pembayaran/${rowDetail.pengajuanId}`,
  };

  const isValid = validationRules[jenisDokumen]?.(rowDetail);
  const href = linkPaths[jenisDokumen];

  if (!isValid || !href) return null;

  return <RenderLink href={href} label={jenisDokumen} />;
};

// LinkToDokumenAkhir component
const LinkToDokumenAkhir = ({
  jenisPengajuan,
  jenisDokumenAkhir,
  riwayatPengajuanId,
}: LinkToDokumenAkhirProps) => {
  if (!jenisPengajuan) return null;
  if (!["dokumentasi", "laporan"].includes(jenisDokumenAkhir)) return null;
  if (["GENERATE_RAMPUNGAN"].includes(jenisPengajuan)) return null; // Skip for rampungan

  const href = `/download/dokumen-akhir/${jenisDokumenAkhir}/${riwayatPengajuanId}`;
  return <RenderLink href={href} label={jenisDokumenAkhir} />;
};

// LinkToDokumens component
const jenisDokumens = [
  "dokumen-rampungan",
  "nominatif-honorarium",
  "nominatif-uh-dalam-negeri",
  "nominatif-uh-luar-negeri",
  "bukti-pembayaran",
];

const LinkToDokumens = ({ kegiatanId, rowDetail }: LinkToDokumensProps) => (
  <div className="flex flex-col gap-2">
    {jenisDokumens.map((jenisDokumen) => (
      <LinkToDokumen
        key={jenisDokumen}
        kegiatanId={kegiatanId}
        jenisDokumen={jenisDokumen}
        rowDetail={rowDetail}
      />
    ))}
  </div>
);

interface StatusBadgeProps {
  status?: STATUS_PENGAJUAN | null;
}
const StatusPengajuan = ({ status }: StatusBadgeProps) => {
  return (
    <div className="flex flex-col gap-2">
      <StatusBadge status={status ?? null} />
    </div>
  );
};

interface DokumenPengajuanProps {
  kegiatanId: string;
  //status?: STATUS_PENGAJUAN | null;
  rowDetail: RowDetail;
}
const DokumenPengajuan = ({ kegiatanId, rowDetail }: DokumenPengajuanProps) => {
  return (
    <div className="flex flex-col gap-2">
      <LinkToDokumens kegiatanId={kegiatanId} rowDetail={rowDetail} />
      {rowDetail.statusPengajuan === "END" && rowDetail.pengajuanId && (
        <div>
          <LinkToDokumenAkhir
            jenisPengajuan={rowDetail.jenisPengajuan}
            jenisDokumenAkhir="dokumentasi"
            riwayatPengajuanId={rowDetail.pengajuanId}
          />
          <LinkToDokumenAkhir
            jenisPengajuan={rowDetail.jenisPengajuan}
            jenisDokumenAkhir="laporan"
            riwayatPengajuanId={rowDetail.pengajuanId}
          />
        </div>
      )}
    </div>
  );
};

export default TabelKegiatan;
