"use client";
import { TabelGenericWithoutInlineEdit } from "@/components/tabel-generic-without-inline-edit";
import { getObPlainJadwalByKegiatanId } from "@/data/jadwal";
import { getRiwayatPengajuanByKegiatanIdAndJenisPengajuanIn } from "@/data/kegiatan/riwayat-pengajuan";
import { formatTanggal } from "@/utils/date-format";
import { JENIS_PENGAJUAN, STATUS_PENGAJUAN } from "@prisma-honorarium/client";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useEffect, useState } from "react";
import StatusBadge from "../status-badge";

interface RowDetail {
  id: string;
  keterangan?: string;
  tanggalKegiatan?: Date | string | null;
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

interface TabelRiwayatPengajuanDetailProps {
  kegiatanId: string | null;
}
const TabelRiwayatPengajuanDetail = ({
  kegiatanId,
}: TabelRiwayatPengajuanDetailProps) => {
  const [details, setDetails] = useState<RowDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!kegiatanId) return;
    const fetchData = async () => {
      setIsLoading(true);
      const newDetails = await fetchDataRiwayatPengajuan(kegiatanId);
      setDetails(newDetails);
      setIsLoading(false);
    };
    fetchData();
  }, [kegiatanId]);

  const columns: ColumnDef<RowDetail>[] = [
    {
      id: "rowNumber",
      header: "#",
      cell: (info) => info.row.index + 1, // Display row number (1-based index)
      footer: "#",
      meta: { className: "w-[50px]" },
    },
    {
      accessorKey: "keterangan",
      header: "Keterangan/Kelas",
      footer: "Keterangan/Kelas",
      meta: { className: "w-[150px]" },
      cell: (info) => {
        return (
          <LinkToDetail
            id={info.row.original.id}
            label={info.getValue() as string}
            jenisPengajuan={info.row.original.jenisPengajuan}
          />
        );
      },
    },
    // {
    //   accessorKey: "tanggalKegiatan",
    //   header: "Tanggal Kegiatan",
    //   footer: "Tanggal Kegiatan",
    //   meta: { className: "w-[100px]" },
    //   cell: (info) => {
    //     return formatTanggal(info.getValue() as Date, "dd-M-yyyy");
    //   },
    // },
    {
      accessorKey: "diajukanTanggal",
      header: "Tanggal Pengajuan",
      footer: "Tanggal Pengajuan",
      meta: { className: "w-[100px]" },
      cell: (info) => {
        return formatTanggal(info.getValue() as Date, "dd-M-yyyy");
      },
    },
    {
      accessorKey: "jenisPengajuan",
      header: "Jenis Pengajuan",
      footer: "Jenis Pengajuan",
      meta: { className: "w-[100px]" },
    },
    {
      accessorKey: "diajukanOleh",
      header: "Operator",
      footer: "Operator",
      meta: { className: "w-[100px]" },
    },
    {
      accessorKey: "statusPengajuan",
      header: "Status",
      footer: "Status",
      meta: { className: "w-[100px]" },
      cell: (info) => {
        const status = info.getValue() as STATUS_PENGAJUAN;
        return <StatusBadge status={status} />;
      },
    },
    {
      accessorKey: "catatanRevisi",
      header: "Catatan Revisi",
      footer: "Catatan Revisi",
      meta: { className: "w-[100px]" },
    },
  ];

  if (isLoading) {
    return <div>Loading riwayat pengajuan...</div>;
  }

  return (
    <div>
      <TabelGenericWithoutInlineEdit
        data={details}
        columns={columns}
        frozenColumnCount={0}
        hidePagination={details.length < 10}
      />
    </div>
  );
};

const jenisPengajuanToDesc = (jenispengajuan: JENIS_PENGAJUAN) => {
  switch (jenispengajuan) {
    case JENIS_PENGAJUAN.GENERATE_RAMPUNGAN:
      return "Generate Rampungan";
    case JENIS_PENGAJUAN.UH_DALAM_NEGERI:
      return "UH Dalam Negeri";
    case JENIS_PENGAJUAN.UH_LUAR_NEGERI:
      return "UH Luar Negeri";
    default:
      return "Unknown";
  }
};

const fetchDataRiwayatPengajuan = async (
  kegiatanId: string
): Promise<RowDetail[]> => {
  // Fetch data here
  const newDetails: RowDetail[] = [];

  try {
    const riwayatRampungan =
      await getRiwayatPengajuanByKegiatanIdAndJenisPengajuanIn(kegiatanId, [
        JENIS_PENGAJUAN.GENERATE_RAMPUNGAN,
        JENIS_PENGAJUAN.UH_DALAM_NEGERI,
        JENIS_PENGAJUAN.UH_LUAR_NEGERI,
      ]);

    if (riwayatRampungan) {
      riwayatRampungan.forEach((riwayat) => {
        newDetails.push({
          id: riwayat.id,
          keterangan: jenisPengajuanToDesc(riwayat.jenis),
          jenisPengajuan: riwayat.jenis,
          statusPengajuan: riwayat.status,
          diajukanOlehId: riwayat.diajukanOlehId,
          diajukanOleh: riwayat.diajukanOleh?.name,
          diajukanTanggal: riwayat.diajukanTanggal,
          diverifikasiTanggal: riwayat.diverifikasiTanggal,
          disetujuiTanggal: riwayat.disetujuiTanggal,
          dibayarTanggal: riwayat.dibayarTanggal,
          catatanRevisi: riwayat.catatanRevisi,
        });
      });
    }

    const jadwals = await getObPlainJadwalByKegiatanId(kegiatanId);
    const newDetailsJadwal: RowDetail[] = jadwals.map((jadwal) => {
      return {
        id: jadwal.id,
        keterangan: jadwal.kelas.nama + " " + jadwal.materi.nama,
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
        catatanRevisi: jadwal.riwayatPengajuan?.catatanRevisi,
      };
    });
    newDetails.push(...newDetailsJadwal);
  } catch (error) {
    console.log(error);
  }

  return newDetails;
};

const LinkToDetail = ({
  id,
  label,
  jenisPengajuan,
}: {
  id: string;
  label: string;
  jenisPengajuan?: JENIS_PENGAJUAN | null;
}) => {
  let linkto = `/kegiatan/${id}`;

  switch (jenisPengajuan) {
    case "GENERATE_RAMPUNGAN":
      linkto = `/pengajuan/rampungan/${id}`;
      break;
    case "HONORARIUM":
      linkto = `/pengajuan/honorarium/${id}`;
      break;
    case "UH_LUAR_NEGERI":
      linkto = `/pengajuan/uh-luar-negeri/${id}`;
      break;
    case "UH_DALAM_NEGERI":
      linkto = `/pengajuan/uh-dalam-negeri/${id}`;
      break;
    case "UH":
      linkto = `/pengajuan/uh/${id}`;
    default:
      break;
  }

  return (
    <Link href={linkto} passHref className="text-blue-500 hover:underline">
      {label}
    </Link>
  );
};

export default TabelRiwayatPengajuanDetail;
