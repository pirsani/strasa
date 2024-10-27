import generateTabelDinamis, {
  DataGroup,
  TableColumnHeader,
  TableDinamisOptions,
  TableFooterOptions,
  TableOptions,
  TableRow,
} from "@/lib/pdf/tabel-nominatif-dinamis";
import { faker } from "@faker-js/faker";
import { NextResponse } from "next/server";

interface Jadwal {
  nama: string; // nama kelas
  tanggal: string;
  jam: string;
  jadwalNarasumber: TableRow[]; // TableRow[] ini dari JadwalNarasumber
}

export async function generateDaftarNominatif(req: Request, slug: string[]) {
  // Example table columns with nested subheaders
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
      header: "Nama Pelaksana SPD/NIP/Jabatan/Pangkat Golongan",
      headerNumberingString: "2",
      field: "peserta",
      width: 120,
      align: "left",
    },
    {
      level: 1,
      header: "Tempat Kedudukan Asal",
      headerNumberingString: "3",
      field: "kedudukanAsal",
      width: 90,
      align: "left",
    },
    {
      level: 1,
      header: "Tingkat Biaya Perjalanan Dinas ",
      headerNumberingString: "4",
      field: "tingkat",
      width: 50,
      align: "left",
    },
    {
      level: 1,
      header: "Alat Angkutan yang digunakan",
      headerNumberingString: "5",
      field: "alatAngkutan",
      width: 90,
      align: "left",
    },
    {
      level: 1,
      header: "Surat Tugas",
      width: 150,
      align: "center",
      subHeader: [
        {
          level: 2,
          header: "Nomor",
          headerNumberingString: "6",
          field: "suratTugasNomor",
          // isSummable: true,
          // format: "currency",
          // currency: "USD",
          width: 75,
          align: "right",
        },
        {
          level: 2,
          header: "Tanggal",
          headerNumberingString: "7",
          field: "suratTugasTanggal",
          // format: "currency",
          // currency: "IDR",
          //isSummable: true,
          width: 75,
          align: "right",
        },
      ],
    },
    {
      level: 1,
      header: "Tanggal",
      width: 100,
      align: "center",
      subHeader: [
        {
          level: 2,
          header: "Berangkat",
          headerNumberingString: "8",
          field: "tanggalBerangkat",
          //isSummable: true,
          width: 50,
          align: "right",
        },
        {
          level: 2,
          header: "Kembali",
          headerNumberingString: "9",
          field: "tanggalKembali",
          width: 50,
          align: "right",
        },
      ],
    },
    {
      level: 1,
      header: "Lama Dinas (hari)",
      headerNumberingString: "10",
      field: "jumlahHariDinas",
      //isSummable: true,
      width: 50,
      align: "center",
    },
    {
      level: 1,
      header: "Keterangan",
      headerNumberingString: "11",
      field: "keterangan",
      width: 90,
      align: "center",
    },
  ];

  const generateFakeData = (count: number): TableRow[] => {
    const rows: TableRow[] = [];
    for (let i = 0; i < count; i++) {
      rows.push({
        no: i + 1,
        peserta: `${faker.person.fullName()} \n ${faker.string.numeric(
          18
        )} \n ${faker.string.numeric(16)} \n ${faker.helpers.arrayElement([
          "III/A",
          "III/B",
          "III/C",
          "III/D",
        ])}
        `,
        kedudukanAsal: faker.location.city(),
        tingkat: faker.helpers.arrayElement(["A", "B", "C", "D"]),
        alatAngkutan: faker.helpers.arrayElement([
          "Kendaraan Darat",
          "Kendaraan Laut",
          "Kendaraan Udara",
        ]),
        suratTugasNomor: faker.string.numeric(10),
        suratTugasTanggal: faker.date.birthdate().toISOString().split("T")[0],
        tanggalBerangkat: faker.date.birthdate().toISOString().split("T")[0],
        tanggalKembali: faker.date.birthdate().toISOString().split("T")[0],
        jumlahHariDinas: faker.number.int({ min: 1, max: 10 }),
        keterangan: faker.lorem.sentence(),
      });
    }
    return rows;
  };

  const rows1: TableRow[] = generateFakeData(1);

  const rows2: TableRow[] = generateFakeData(2);

  const rows3: TableRow[] = generateFakeData(3);

  const jadwal1: DataGroup = {
    nama: "Kelas A",
    groupMembers: rows1,
  };

  const jadwal2: DataGroup = {
    nama: "Kelas B",
    groupMembers: rows2,
  };

  const jadwal3: DataGroup = {
    nama: "Kelas C",
    groupMembers: rows3,
  };

  const jadwals = [
    jadwal1,
    jadwal3,
    jadwal3,
    jadwal3,
    jadwal3,
    jadwal1,
    jadwal3,
    jadwal3,
    jadwal3,
    jadwal3,
    jadwal2,
    jadwal1,
    //jadwal1,
    jadwal2,
  ];

  const tableOptions: TableOptions = {
    startX: 30,
    startY: 75,
    startYonFirstPage: 130,
    headerRowHeight: 25,
    headerNumberingRowHeight: 15,
    dataRowHeight: 60,
  };
  try {
    const satker = "Pusat Pendidikan dan Pelatihan ";
    const titleText = `DAFTAR NOMINATIF HONORARIUM NARASUMBER/PEMBAHAS PAKAR/ PRAKTISI/ PROFESIONAL`;
    const subtitleText = `KEGIATAN PELATIHAN DAN PENGEMBANGAN KOMPETENSI PEGAWAI NEGERI SIPIL`;

    const footerOptions: TableFooterOptions = {
      kiri: { text: "test", nama: "fulan", NIP: "6537327432" },
      kanan: { text: "test", nama: "fulan", NIP: "6537327432" },
    };

    const tabelDinamisOptions: TableDinamisOptions = {
      satker,
      tableTitle: titleText,
      tableSubtitle: subtitleText,
      tableData: jadwals,
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

export async function downloadTest(req: Request, slug: string[]) {
  return await generateDaftarNominatif(req, slug);
}

export default downloadTest;
