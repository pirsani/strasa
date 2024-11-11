import { dbHonorarium } from "@/lib/db-honorarium";
import generateTabelDinamis, {
  DataGroup,
  TableColumnHeader,
  TableDinamisOptions,
  TableFooterOptions,
  TableOptions,
  TableRow,
} from "@/lib/pdf/tabel-nominatif-dinamis-uh";
import { formatTanggal } from "@/utils/date-format";
import getKursBankIndonesia from "@/utils/kurs-bi";
import { SbmUhLuarNegeri } from "@prisma-honorarium/client";
import Decimal from "decimal.js";
import { NextResponse } from "next/server";
import { Logger } from "tslog";

const logger = new Logger({
  hideLogPositionForProduction: true,
});

interface Jadwal {
  nama: string; // nama kelas
  tanggal: string;
  jam: string;
  jadwalNarasumber: TableRow[]; // TableRow[] ini dari JadwalNarasumber
}

const columns: TableColumnHeader[] = [
  {
    level: 1,
    header: "No.",
    headerNumberingString: "1",
    field: "no",
    width: 30,
    align: "center",
  },
  {
    level: 1,
    header: "NAMA/NIP/Jabatan/Golongan",
    headerNumberingString: "2",
    field: "namaNipNpwp",
    width: 150,
    align: "left",
  },

  {
    level: 1,
    header: "Penerimaan",
    width: 400,
    align: "center",
    subHeader: [
      {
        level: 2,
        header: "Jenis",
        headerNumberingString: "3",
        field: "jenis",
        width: 100,
        align: "center",
      },
      {
        level: 2,
        header: "hr",
        headerNumberingString: "4",
        field: "hr",
        width: 25,
        align: "center",
      },
      {
        level: 2,
        header: "USD",
        headerNumberingString: "4",
        field: "usd",
        width: 45,
        align: "right",
      },
      {
        level: 2,
        header: "Besaran",
        headerNumberingString: "6",
        field: "besaran",
        // format: "currency",
        // currency: "IDR",
        width: 65,
        align: "right",
      },
      {
        level: 2,
        header: "Jumlah (USD)",
        headerNumberingString: "7",
        field: "jumlah",
        //format: "currency",
        //currency: "IDR",
        //isSummable: true,
        width: 65,
        align: "right",
      },
      {
        level: 2,
        header: "%",
        headerNumberingString: "8",
        field: "persentase",
        width: 35,
        align: "right",
      },
      {
        level: 2,
        header: "Total (Rp.)",
        headerNumberingString: "9",
        field: "total",
        format: "currency",
        currency: "IDR",
        isSummable: true,
        width: 65,
        align: "right",
      },
    ],
  },
  {
    level: 1,
    header: "NAMA DAN NOMOR REKENING",
    headerNumberingString: "11",
    field: "bankConcated",
    width: 90,
    align: "center",
  },
];

export async function generateDaftarNominatif(req: Request, slug: string[]) {
  // Example table columns with nested subheaders

  const kegiatanId = slug[1];

  const kegiatan = await dbHonorarium.kegiatan.findFirst({
    where: {
      id: kegiatanId,
    },
    include: {
      itinerary: true,
      pesertaKegiatan: {
        include: {
          uhLuarNegeri: true,
        },
      },
    },
  });

  if (!kegiatan) {
    throw new Error("Kegiatan not found");
  }

  if (!kegiatan.itinerary) {
    throw new Error("Itinerary not found");
  }

  if (!kegiatan.pesertaKegiatan || kegiatan.pesertaKegiatan.length === 0) {
    throw new Error("Peserta kegiatan not found");
  }

  const negaraInItinerary = kegiatan.itinerary.map((it) => it.keLokasiId);
  // filter IDN because it's not a foreign country
  const negara = negaraInItinerary.filter((n) => n !== "IDN");
  logger.debug("negara", negara);

  // find SBM that exist in itinerary
  const tahunSbm = kegiatan.tanggalMulai.getFullYear();
  const sbm = await dbHonorarium.sbmUhLuarNegeri.findMany({
    where: {
      tahun: tahunSbm,
      negaraId: {
        in: negara,
      },
    },
    include: {
      negara: true,
    },
  });

  //logger.debug("sbm", sbm);

  if (!sbm || sbm.length === 0) {
    const error = `E-SBMUHDN-01`;
    const message = `SBM Uang Harian tahun ${tahunSbm} tidak ditemukan, silakan impor data SBM Uang Harian terlebih dahulu.`;
    logger.error(error, message);
    throw new Error(message);
  }

  // notify which SBM that not found
  const notFoundSbm = negara.filter((n) => !sbm.find((s) => s.negaraId === n));
  if (notFoundSbm.length > 0) {
    const error = `E-SBMUHDN-02`;
    const message = `SBM Uang Harian tahun ${tahunSbm} negara ${notFoundSbm.join(
      ", "
    )} tidak ditemukan, silakan impor data SBM Uang Harian terlebih dahulu.`;
    logger.error(error, message);
    throw new Error(message);
  }

  //get kurs Bank Indonesia
  const kurs = await getKursBankIndonesia(new Date());
  if (!kurs) {
    throw new Error("Kurs not found");
  }

  const kursTengah = (kurs.jual + kurs.beli) / 2;
  kurs.tengah = kursTengah;

  const riwayatPengajuan = await dbHonorarium.riwayatPengajuan.findFirst({
    where: {
      kegiatanId,
      jenis: "UH_LUAR_NEGERI",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      bendahara: true,
      ppk: true,
    },
  });

  if (!riwayatPengajuan) {
    throw new Error("Riwayat pengajuan not found");
  }

  const { bendahara, ppk } = riwayatPengajuan;

  const pesertaKegiatan = kegiatan.pesertaKegiatan;

  let n = 0;

  type GolonganUhLuarNegeri = "A" | "B" | "C" | "D" | null;

  const getSbmLokasi = (
    lokasiId: string,
    golonganUhLuarNegeri: GolonganUhLuarNegeri
  ) => {
    if (!golonganUhLuarNegeri) {
      return { namaNegara: "", sbmGolongan: 0 };
    }
    const sbmLokasi = sbm.find((s) => s.negaraId === lokasiId);
    if (sbmLokasi) {
      const golonganKey =
        `golongan${golonganUhLuarNegeri}` as keyof SbmUhLuarNegeri;
      const sbmGolongan = sbmLokasi[golonganKey] as number;
      const namaNegara = sbmLokasi.negara.nama;
      //return sbmLokasi[golonganKey] as number;
      return { namaNegara, sbmGolongan };
    }
    return { namaNegara: "", sbmGolongan: 0 };
  };

  const rows: TableRow[] = pesertaKegiatan.map((peserta) => {
    n += 1;
    const golonganUhLuarNegeri = peserta.golonganUhLuarNegeri;
    const pangkatGolonganId = peserta.pangkatGolonganId ?? "-";
    const nip = peserta.NIP ?? "-";
    const namaNipNpwp =
      peserta.nama +
      "\n" +
      nip +
      "\n" +
      peserta.jabatan +
      "\n" +
      pangkatGolonganId;

    const bank =
      peserta.namaRekening + "\n" + peserta.bank + "\n" + peserta.nomorRekening;

    let jenis = "";
    let besaran = "";
    let jumlah = "";
    let persentase = "";
    let totalUsd = new Decimal(0);
    let total = 0;
    let hr = "";
    let usd = "";
    if (peserta.uhLuarNegeri) {
      const coefUhp = new Decimal(0.4);
      const uhLuarNegeri = peserta.uhLuarNegeri;
      uhLuarNegeri.forEach((uh) => {
        const { namaNegara, sbmGolongan } = getSbmLokasi(
          uh.keLokasiId,
          uh.golonganUh as GolonganUhLuarNegeri
        );
        logger.debug("uh", uh);
        if (uh.hUangHarian) {
          persentase += "100%\n";
          jenis += "UH-" + namaNegara + "\n";
          besaran += sbmGolongan.toString() + "\n";
          usd += sbmGolongan.toString() + "\n";
          jumlah += uh.uhUangHarian.toString() + "\n";
          totalUsd = totalUsd.add(uh.uhUangHarian);
          hr += uh.hUangHarian.toString() + "\n";
        }

        if (uh.hPerjalanan) {
          const uhp = coefUhp.times(sbmGolongan);
          persentase += "40%\n";
          jenis += "UHP-" + namaNegara + "\n";
          besaran += uhp.toString() + "\n";
          usd += uhp.toString() + "\n";
          jumlah += uh.uhPerjalanan.toString() + "\n";
          totalUsd = totalUsd.add(uh.uhPerjalanan);
          hr += uh.hPerjalanan.toString() + "\n";
        }
      });

      // besaran = peserta.uhLuarNegeri.besaran;
      // jumlah = peserta.uhLuarNegeri.jumlah;
      // persentase = peserta.uhLuarNegeri.persentase;
      // total = peserta.uhLuarNegeri.total;
      total = totalUsd.times(kursTengah).toNumber();
    }

    console.log("[totalUsd]", totalUsd);

    return {
      no: n.toString(),
      jenis,
      hr,
      usd,
      besaran,
      jumlah,
      persentase,
      total,
      namaNipNpwp: namaNipNpwp,
      bankConcated: bank,
    };
  });

  const dataGroup: DataGroup[] = [
    {
      nama: "",
      groupMembers: rows,
    },
  ];

  // const jadwal1: DataGroup = {
  //   nama: "Kelas A",
  //   groupMembers: rows,
  // };

  // const jadwals = [jadwal1];

  const tableOptions: TableOptions = {
    startX: 75,
    startY: 75,
    startYonFirstPage: 130,
    headerRowHeight: 25,
    headerNumberingRowHeight: 15,
    dataRowHeight: 60,
  };
  try {
    const satker = "Pusat Pendidikan dan Pelatihan ";
    const titleText = `DAFTAR NOMINATIF UANG HARIAN`;
    const subtitleText = kegiatan.nama.toUpperCase();

    const hariIni = formatTanggal(new Date());

    const footerOptions: TableFooterOptions = {
      kiri: {
        text: "Mengetahui/Menyetujui\nPejabat Pembuat Komitmen:",
        nama: ppk?.nama ?? "",
        NIP: ppk?.NIP ?? "",
      },
      kanan: {
        text: `Yang Membayarkan,\nBendaharaPengeluaran`,
        nama: bendahara?.nama ?? "",
        NIP: bendahara?.NIP ?? "",
      },
      placeAndDateText: {
        place: "Jakarta, ",
        date: hariIni,
        position: "kanan",
      },
    };

    const tabelDinamisOptions: TableDinamisOptions = {
      layout: "landscape",
      satker,
      tableTitle: titleText,
      tableSubtitle: subtitleText,
      tableData: dataGroup,
      tableColumnHeaders: columns,
      tableOptions: tableOptions,
      tableFooterOptions: footerOptions,
    };
    const pdfBuffer = await generateTabelDinamis(tabelDinamisOptions);
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        // "Content-Disposition": 'attachment; filename="payroll.pdf"',
      },
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to generate PDF");
  }
}

export async function downloadNominatifUhLuarNegeri(
  req: Request,
  slug: string[]
) {
  return await generateDaftarNominatif(req, slug);
}

export default downloadNominatifUhLuarNegeri;
