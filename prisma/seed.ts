import { dbHonorarium } from "@/lib/db-honorarium";
import { es, faker } from "@faker-js/faker";
import { LOKASI, Organisasi, Provinsi } from "@prisma-honorarium/client";
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing and comparison
import csv from "csv-parser";
import { tr } from "date-fns/locale";
import fs from "fs";
import path, { resolve } from "path";

interface permission {
  name: string;
  description: string;
}

const seedPermission = async (): Promise<void> => {
  console.log("Seeding Permission data");
  const results: permission[] = [];
  const csvPath = "docs/data-referensi/permission.csv";
  const permissionDataPath = path.resolve(process.cwd(), csvPath);
  return new Promise((resolve, reject) => {
    fs.createReadStream(permissionDataPath)
      .pipe(csv({ separator: ";" }))
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        try {
          for (const row of results) {
            //console.log(row);
            await dbHonorarium.permission.create({
              data: {
                name: row.name,
                description: row.description,
                createdBy: "init",
                createdAt: new Date(),
              },
            });
          }
          console.log("Data Permission seeded successfully");
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (error) => reject(error));
  });
};

interface UnitKerjaCsvColumns {
  nama: string;
  singkatan: string;
  isSatkerAnggaran: boolean;
  eselon: number;
  indukOrganisasiId: string;
}

const seedUnitKerja = async (): Promise<Organisasi[]> => {
  console.log("set Kemlu");

  const unitKerja: Organisasi[] = [];

  await dbHonorarium.organisasi.create({
    data: {
      id: "cm1n901tl0000w0u0zzwkdzw0",
      nama: "Kementerian Luar Negeri",
      singkatan: "Kemlu",
      createdBy: "init",
    },
  });

  console.log("Seeding unit kerja data");
  const results: UnitKerjaCsvColumns[] = [];
  const csvPath = "docs/data-referensi/unit-kerja.csv";
  const unitKerjaDataPath = path.resolve(process.cwd(), csvPath);
  return new Promise((resolve, reject) => {
    fs.createReadStream(unitKerjaDataPath)
      .pipe(csv({ separator: ";" }))
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        try {
          for (const row of results) {
            //console.log(row);
            const newUnitKerja = await dbHonorarium.organisasi.create({
              data: {
                nama: row.nama,
                singkatan: row.singkatan,
                isSatkerAnggaran: row.isSatkerAnggaran ? true : false,
                eselon: Number(row.eselon),
                createdBy: "init",
                indukOrganisasiId: row.indukOrganisasiId,
                createdAt: new Date(),
              },
            });
            unitKerja.push(newUnitKerja);
          }
          console.log("Data seeded successfully");
          resolve(unitKerja);
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (error) => reject(error));
  });
};

interface NegaraRow {
  id: string;
  urutan: string;
  nama: string;
  nama_inggris: string;
  kode_alpha_2: string;
  kode_alpha_3: string;
  kode_numeric: string;
}
const seedNegara = async (): Promise<void> => {
  console.log("Seeding Negara data");
  const results: NegaraRow[] = [];

  const csvPath = "docs/data-referensi/negara.csv";
  const negaraDataPath = path.resolve(process.cwd(), csvPath);
  return new Promise((resolve, reject) => {
    fs.createReadStream(negaraDataPath)
      .pipe(csv({ separator: ";" }))
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        try {
          for (const row of results) {
            console.log("insert negara", row);
            await dbHonorarium.negara.create({
              data: {
                id: row.id,
                urutan: parseInt(row.urutan) || null,
                nama: row.nama,
                namaInggris: row.nama_inggris,
                kodeAlpha2: row.kode_alpha_2,
                kodeAlpha3: row.kode_alpha_3,
                kodeNumeric: row.kode_numeric,
                createdBy: "init",
                createdAt: new Date(),
                //updatedBy: null,
                //updatedAt: null,
              },
            });
          }
          console.log("Data Negara seeded successfully");
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (error) => reject(error));
  });
};

interface ProvinsiRow {
  id: string;
  tahun: string;
  kode: string;
  nama: string;
  nama_singkatan: string | null;
  aktif: string;
  created_by: string;
  created_at: string;
  updated_by: string | null;
  updated_at: string | null;
}

const seedProvinsi = async (): Promise<void> => {
  console.log("Seeding provinsi data");
  const results: ProvinsiRow[] = [];

  const csvPath = "docs/data-referensi/provinsi.csv";
  const provinsiDataPath = path.resolve(process.cwd(), csvPath);
  return new Promise((resolve, reject) => {
    fs.createReadStream(provinsiDataPath)
      .pipe(csv({ separator: ";" }))
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        try {
          let urutan = 1;
          for (const row of results) {
            //console.log(row);
            await dbHonorarium.provinsi.create({
              data: {
                id: row.id,
                tahun: parseInt(row.tahun || "2022"),
                kode: row.kode,
                nama: row.nama,
                singkatan: row.nama_singkatan || null,
                aktif: true,
                urutan: urutan++,
                createdBy: "init",
                createdAt: new Date(),
                //updatedBy: null,
                //updatedAt: null,
              },
            });
          }
          console.log("Data Provinsi seeded successfully");
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (error) => reject(error));
  });
};

interface KotaRow {
  id: string;
  provinsi_id: string;
  nama: string;
}
const seedKota = async (): Promise<void> => {
  console.log("Seeding Kota data");
  const results: KotaRow[] = [];

  const csvPath = "docs/data-referensi/kota.csv";
  const kotaDataPath = path.resolve(process.cwd(), csvPath);
  return new Promise((resolve, reject) => {
    fs.createReadStream(kotaDataPath)
      .pipe(csv({ separator: ";" }))
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        try {
          for (const row of results) {
            //console.log(row);
            await dbHonorarium.kota.create({
              data: {
                id: row.id,
                provinsiId: row.provinsi_id,
                nama: row.nama,
                aktif: true,
                createdBy: "init",
                createdAt: new Date(),
                //updatedBy: null,
                //updatedAt: null,
              },
            });
          }
          console.log("Data seeded successfully");
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (error) => reject(error));
  });
};

const deleteExisting = async (): Promise<void> => {
  // Truncate the table
  try {
    console.log("Deleting existing data");

    await dbHonorarium.sbmTaksi.deleteMany({});
    await dbHonorarium.sbmHonorarium.deleteMany({});
    await dbHonorarium.sbmUhDalamNegeri.deleteMany({});
    await dbHonorarium.sbmUhLuarNegeri.deleteMany({});
    await dbHonorarium.jadwalNarasumber.deleteMany({});
    await dbHonorarium.jadwal.deleteMany({});
    await dbHonorarium.materi.deleteMany({});
    await dbHonorarium.kelas.deleteMany({});
    await dbHonorarium.riwayatProses.deleteMany({});
    await dbHonorarium.dokumenSuratTugas.deleteMany({});
    await dbHonorarium.pesertaKegiatan.deleteMany({});
    await dbHonorarium.itinerary.deleteMany({});
    await dbHonorarium.dokumenKegiatan.deleteMany({});
    await dbHonorarium.uploadedFile.deleteMany({});
    await dbHonorarium.kegiatan.deleteMany({});
    await dbHonorarium.pejabatPerbendaharaan.deleteMany({});
    await dbHonorarium.jenisJabatanPerbendaharaan.deleteMany({});
    await dbHonorarium.sbmHonorarium.deleteMany({});
    await dbHonorarium.organisasi.deleteMany({});
    await dbHonorarium.jenisDokumenKegiatan.deleteMany({});
    await dbHonorarium.materi.deleteMany({});
    await dbHonorarium.narasumber.deleteMany({});
    await dbHonorarium.pangkatGolongan.deleteMany({});
    await dbHonorarium.sbmHonorarium.deleteMany({});
    await dbHonorarium.pmkAcuan.deleteMany({});
    await dbHonorarium.userPreference.deleteMany({});
    await dbHonorarium.user.deleteMany({});
    await dbHonorarium.rolePermission.deleteMany({});
    await dbHonorarium.permission.deleteMany({});
    await dbHonorarium.userRole.deleteMany({});
    await dbHonorarium.role.deleteMany({});
    await dbHonorarium.sbmUangRepresentasi.deleteMany({});
    await dbHonorarium.pejabat.deleteMany({});
    await dbHonorarium.kota.deleteMany({});
    await dbHonorarium.provinsi.deleteMany({});
    await dbHonorarium.negara.deleteMany({});

    console.log("Existing data deleted successfully");
  } catch (error) {
    console.error("Error deleting existing data:", error);
    throw error;
  }
};

async function main() {
  await deleteExisting();
  await seedPermission();
  const initialUnitKerja = await seedUnitKerja();
  await seedNegara();
  await seedProvinsi();
  await seedKota();

  // const routes = await dbHonorarium.jadwal.findMany({});
  // console.log(routes);

  const unitDiPusdiklat = await dbHonorarium.organisasi.createMany({
    data: [
      {
        nama: "Bidang Perencanaan, Pengembangan, dan Evaluasi",
        singkatan: "PPE",
        isSatkerAnggaran: false,
        eselon: 3,
        createdBy: "init",
        indukOrganisasiId: initialUnitKerja[10].id,
      },
      {
        nama: "Bidang Pendidikan dan Pelatihan Nondiplomatik",
        singkatan: "Diklat Nondiplomatik",
        isSatkerAnggaran: false,
        eselon: 3,
        createdBy: "init",
        indukOrganisasiId: initialUnitKerja[10].id,
      },
      {
        nama: "Bidang Pendidikan dan Pelatihan Teknis",
        singkatan: "Diklat Teknis",
        isSatkerAnggaran: false,
        eselon: 3,
        createdBy: "init",
        indukOrganisasiId: initialUnitKerja[10].id,
      },
      {
        nama: "Bidang Kerja Sama Pendidikan dan Pelatihan",
        singkatan: "KS Diklat",
        isSatkerAnggaran: false,
        eselon: 3,
        createdBy: "init",
        indukOrganisasiId: initialUnitKerja[10].id,
      },
      {
        nama: "Bagian Tata Usaha",
        singkatan: "TU",
        isSatkerAnggaran: false,
        eselon: 3,
        createdBy: "init",
        indukOrganisasiId: initialUnitKerja[10].id,
      },
    ],
  });

  const dokumenKegiatan = await dbHonorarium.jenisDokumenKegiatan.createMany({
    data: [
      {
        id: "nodin-memo-sk",
        nama: "nota-dinas-memorandum-sk",
        createdBy: "init",
        deskripsi: "Nota Dinas/Memorandum/ SK Tim",
        untukLokasiDi: "0;1;2;",
      },
      {
        id: "jadwal-kegiatan",
        nama: "jadwal-kegiatan",
        createdBy: "init",
        deskripsi: "Jadwal Kegiatan",
        untukLokasiDi: "0;1;2;",
      },
      {
        id: "surat-tugas",
        nama: "surat-tugas",
        createdBy: "init",
        deskripsi: "Surat Tugas",
        untukLokasiDi: "0;1;2;",
        isMultiple: true,
      },
      {
        id: "peserta-xlsx",
        nama: "peserta-xlsx",
        createdBy: "init",
        deskripsi: "daftar peserta dalam format excel",
        untukLangkahKe: 0,
        untukLokasiDi: "0;1;2;",
      },
      {
        id: "surat-setneg-sptjm",
        nama: "surat-setneg-sptjm",
        createdBy: "init",
        deskripsi: "Surat Setneg/SPTJM",
        untukLokasiDi: "2;",
      },
      {
        id: "surat-persetujuan-jaldis-setneg",
        nama: "surat-persetujuan-jaldis-setneg",
        createdBy: "init",
        deskripsi:
          "Surat Persetujuan Jaldis dari Kementerian Sekretaris Negara",
        untukLokasiDi: "2;",
      },
      {
        id: "laporan-kegiatan",
        nama: "laporan-kegiatan",
        createdBy: "init",
        deskripsi: "Laporan Kegiatan",
        untukLangkahKe: 1,
        untukLokasiDi: "0;1;2;",
      },
      {
        id: "daftar-hadir",
        nama: "daftar-hadir",
        createdBy: "init",
        deskripsi: "Daftar Hadir",
        untukLangkahKe: 1,
        untukLokasiDi: "0;1;2;",
      },
      {
        id: "dokumentasi-kegiatan",
        nama: "dokumentasi-kegiatan",
        createdBy: "init",
        deskripsi: "Dokumentasi Kegiatan",
        untukLangkahKe: 1,
        untukLokasiDi: "0;1;2;",
      },
      {
        id: "rampungan-terstempel",
        nama: "rampungan-terstempel",
        createdBy: "init",
        deskripsi: "Rampungan yang distempel",
        untukLangkahKe: 1,
        untukLokasiDi: "0;1;2;",
      },
      {
        id: "paspor",
        nama: "paspor",
        createdBy: "init",
        deskripsi: "Paspor (ID, exit permit, stempel imigrasi)",
        untukLangkahKe: 1,
        untukLokasiDi: "2;",
      },
      {
        id: "tiket-boarding-pass",
        nama: "tiket-boarding-pass",
        createdBy: "init",
        deskripsi: "Tiket atau boarding pass",
        untukLangkahKe: 1,
        untukLokasiDi: "2;",
      },
    ],
  });

  const jenisPejabatPerbendaharaan =
    await dbHonorarium.jenisJabatanPerbendaharaan.createMany({
      data: [
        {
          id: "KPA",
          nama: "Kuasa Pengguna Anggaran",
          singkatan: "KPA",
          createdBy: "init",
        },
        {
          id: "PPK",
          nama: "Pejabat Pembuat Komitmen",
          singkatan: "PPK",
          createdBy: "init",
        },
        {
          id: "PPSPM",
          nama: "Pejabat Penandatangan Surat Perintah Membayar ",
          singkatan: "PPSPM",
          createdBy: "init",
        },
        {
          id: "bendahara-pengeluaran",
          nama: "Bendahara Pengeluaran",
          createdBy: "init",
        },
        {
          id: "bendahara-penerimaan",
          nama: "Bendahara Penerimaan",
          createdBy: "init",
        },
      ],
    });

  // Truncate the table
  const role = await dbHonorarium.role.createMany({
    data: [
      {
        id: "superadmin",
        name: "Superadmin",
        createdBy: "init",
      },
      {
        name: "Admin",
        createdBy: "init",
      },
      {
        name: "Bendahara",
        createdBy: "init",
      },
      {
        name: "Operator Keuangan",
        createdBy: "init",
      },
      {
        name: "Uploader",
        createdBy: "init",
      },
      {
        name: "Viewer",
        createdBy: "init",
      },
    ],
  });

  const password = await bcrypt.hash(
    process.env.INIT_ADMIN_PASSWORD || "123456",
    10
  );

  const pass = bcrypt.hashSync("123456", 10);
  const user = await dbHonorarium.user.createMany({
    data: [
      {
        id: "admin",
        password: password,
        name: "admin",
        email: "admin@super.id",
        organisasiId: "cm1n901tl0000w0u0zzwkdzw0",
      },
      {
        password: pass,
        name: "admin.pusdiklat",
        email: "admin.pusdiklat@pirsani.id",
        organisasiId: initialUnitKerja[10].id,
      },
    ],
  });

  const userRole = await dbHonorarium.userRole.createMany({
    data: [
      {
        userId: "admin",
        roleId: "superadmin",
      },
    ],
  });

  const kegiatanLuarKota = await dbHonorarium.kegiatan.create({
    data: {
      nama: "Kegiatan LuarKota",
      createdBy: "admin",
      keterangan: "Kegiatan LuarKota",
      tanggalMulai: new Date(),
      tanggalSelesai: new Date(),
      lokasi: LOKASI.LUAR_KOTA,
      dokumenNodinMemoSk: "123456789.pdf",
      dokumenJadwal: "123456789.pdf",
      satkerId: initialUnitKerja[10].id,
      unitKerjaId: initialUnitKerja[10].id,
      provinsiId: "18",
      status: "setup-kegiatan",
    },
  });

  const kegiatanLuarNegeri = await dbHonorarium.kegiatan.create({
    data: {
      nama: "Kegiatan Luar Negeri",
      createdBy: "admin",
      keterangan: "Kegiatan Luar Negeri",
      tanggalMulai: new Date(),
      tanggalSelesai: new Date(),
      lokasi: LOKASI.LUAR_NEGERI,
      dokumenNodinMemoSk: "123456789.pdf",
      dokumenJadwal: "123456789.pdf",
      satkerId: initialUnitKerja[10].id,
      unitKerjaId: initialUnitKerja[10].id,
      status: "setup-kegiatan",
    },
  });

  const kegiatan = await dbHonorarium.kegiatan.create({
    data: {
      nama: "Kegiatan DalamKota",
      createdBy: "admin",
      keterangan: "Kegiatan DalamKota",
      tanggalMulai: new Date(),
      tanggalSelesai: new Date(),
      lokasi: LOKASI.DALAM_KOTA,
      dokumenNodinMemoSk: "123456789.pdf",
      dokumenJadwal: "123456789.pdf",
      satkerId: initialUnitKerja[10].id,
      unitKerjaId: initialUnitKerja[10].id,
      status: "setup-kegiatan",
    },
  });

  const kelas = await dbHonorarium.kelas.createMany({
    data: [
      {
        nama: "Kelas A",
        createdBy: "init",
        kode: "PDK-75-A",
        kegiatanId: kegiatan.id,
      },
      {
        nama: "Kelas B",
        createdBy: "init",
        kode: "PDK-75-B",
        kegiatanId: kegiatan.id,
      },
    ],
  });

  const materi = await dbHonorarium.materi.createMany({
    data: [
      {
        kode: "PDK-A001",
        nama: "Entrepreurship in Digital Age",
        createdBy: "init",
      },
      {
        kode: "PDK-A002",
        nama: "Digital Marketing",
        createdBy: "init",
      },
      {
        kode: "PDK-A003",
        nama: "Digital Transformation",
        createdBy: "init",
      },
      {
        kode: "PDK-A004",
        nama: "Digital Diplomacy",
        createdBy: "init",
      },

      {
        kode: "PDK-A005",
        nama: "ASEAN: overview and challenges",
        createdBy: "init",
      },
      {
        kode: "PDK-A006",
        nama: "OECD: cooperation and opportunities",
        createdBy: "init",
      },
      {
        kode: "PDK-A007",
        nama: "ASEAN: regional security",
        createdBy: "init",
      },
      {
        kode: "PDK-A008",
        nama: "ASEAN: economic integration",
        createdBy: "init",
      },
      {
        kode: "PID-A001",
        nama: "Digital Economy",
        createdBy: "init",
      },
      {
        kode: "PID-A002",
        nama: "Digital Governance",
        createdBy: "init",
      },
      {
        kode: "PID-A003",
        nama: "Digital Society",
        createdBy: "init",
      },
      {
        kode: "PID-A004",
        nama: "Digital Security",
        createdBy: "init",
      },
    ],
  });

  const pangkatGolongan = await dbHonorarium.pangkatGolongan.createMany({
    data: [
      {
        id: "I/A",
        pangkat: "Juru Muda",
        golongan: "I",
        ruang: "A",
        createdBy: "init",
      },
      {
        id: "I/B",
        pangkat: "Juru Muda Tingkat 1",
        golongan: "I",
        ruang: "B",
        createdBy: "init",
      },
      {
        id: "I/C",
        pangkat: "Juru Muda Tingkat 2",
        golongan: "I",
        ruang: "C",
        createdBy: "init",
      },
      {
        id: "I/D",
        pangkat: "Juru",
        golongan: "I",
        ruang: "D",
        createdBy: "init",
      },
      {
        id: "II/A",
        pangkat: "Pengatur Muda",
        golongan: "II",
        ruang: "A",
        createdBy: "init",
      },
      {
        id: "II/B",
        pangkat: "Pengatur Muda Tingkat 1",
        golongan: "II",
        ruang: "B",
        createdBy: "init",
      },
      {
        id: "II/C",
        pangkat: "Pengatur",
        golongan: "II",
        ruang: "C",
        createdBy: "init",
      },
      {
        id: "II/D",
        pangkat: "Pengatur Tingkat 1",
        golongan: "II",
        ruang: "D",
        createdBy: "init",
      },
      {
        id: "III/A",
        pangkat: "Penata Muda",
        golongan: "III",
        ruang: "A",
        createdBy: "init",
      },
      {
        id: "III/B",
        pangkat: "Penata Tingkat 1",
        golongan: "III",
        ruang: "B",
        createdBy: "init",
      },
      {
        id: "III/C",
        pangkat: "Penata",
        golongan: "III",
        ruang: "C",
        createdBy: "init",
      },
      {
        id: "III/D",
        pangkat: "Penata Tingkat 1",
        golongan: "III",
        ruang: "D",
        createdBy: "init",
      },
      {
        id: "IV/A",
        pangkat: "Pembina",
        golongan: "IV",
        ruang: "A",
        createdBy: "init",
      },
      {
        id: "IV/B",
        pangkat: "Pembina Tingkat 1",
        golongan: "IV",
        ruang: "B",
        createdBy: "init",
      },
      {
        id: "IV/C",
        pangkat: "Pembina Muda",
        golongan: "IV",
        ruang: "C",
        createdBy: "init",
      },
      {
        id: "IV/D",
        pangkat: "Pembina Madya",
        golongan: "IV",
        ruang: "D",
        createdBy: "init",
      },
      {
        id: "IV/E",
        pangkat: "Pembina Utama",
        golongan: "IV",
        ruang: "E",
        createdBy: "init",
      },
    ],
  });

  const narasumber = await dbHonorarium.narasumber.createMany({
    data: [
      {
        id: "1234567891234567", // ini adalah NIK 16 digit
        nama: "Dr. Rizal Sukma",
        NIP: "196509241992031001",
        pangkatGolonganId: "IV/D",
        createdBy: "init",
        email: "",
      },
      {
        id: "1234567891234568", // ini adalah NIK 16 digit
        nama: "Dr. Bertiga",
        NIP: "196509241992031002",
        pangkatGolonganId: "IV/C",
        createdBy: "init",
        email: "",
      },
      {
        id: "1234567891234569", // ini adalah NIK 16 digit
        nama: "Dr. Madya Bendahara",
        NIP: "197509241992031001",
        pangkatGolonganId: "IV/B",
        createdBy: "init",
        email: "",
      },
      {
        id: "1234567891234570", // ini adalah NIK 16 digit
        nama: "Dr. Siapa lah",
        NIP: "198509241992031001",
        pangkatGolonganId: "IV/A",
        createdBy: "init",
        email: "",
      },
    ],
  });

  const narasumberData = Array.from({ length: 100 }).map(() => ({
    id: faker.string.numeric(16), // Generate a unique ID
    nama: faker.person.fullName(), // Generate a random full name
    NIP: faker.string.numeric(18), // Generate a random 18-digit string
    jabatan: faker.person.jobTitle(), // Generate a random job title
    //eselon: faker.helpers.arrayElement(["", "I", "II", "III"]), // Generate a random eselon
    eselon: faker.helpers.arrayElement([null, 1, 2, 3, 4]), // Generate a random eselon
    pangkatGolonganId: faker.helpers.arrayElement([
      "IV/A",
      "IV/B",
      "IV/C",
      "IV/D",
      "IV/E",
    ]),
    email: faker.internet.email(),
    nomorTelepon: faker.phone.number(),
    bank: faker.helpers.arrayElement(["BNI", "BCA", "Mandiri", "BRI"]),
    namaRekening: faker.person.fullName(),
    nomorRekening: faker.string.numeric(10),
    createdBy: "init",
  }));

  // Insert the generated data into the database
  const narasumberFaker = await dbHonorarium.narasumber.createMany({
    data: narasumberData,
  });

  const materiku = await dbHonorarium.materi.findMany({
    where: {
      createdBy: "init",
    },
  });

  const kelasku = await dbHonorarium.kelas.findMany({
    where: {
      createdBy: "init",
    },
  });

  const narasumberku = await dbHonorarium.narasumber.findMany({
    where: {
      createdBy: "init",
    },
  });

  const jadwal = await dbHonorarium.jadwal.createMany({
    data: [
      {
        kegiatanId: kegiatan.id,
        kelasId: kelasku[0].id,
        materiId: materiku[0].id,
        tanggal: new Date(),
        createdBy: "init",
      },
      {
        kegiatanId: kegiatan.id,
        kelasId: kelasku[0].id,
        materiId: materiku[1].id,
        tanggal: new Date(),
        createdBy: "init",
      },
      {
        kegiatanId: kegiatan.id,
        kelasId: kelasku[1].id,
        materiId: materiku[2].id,
        tanggal: new Date(),
        createdBy: "init",
      },
      {
        kegiatanId: kegiatan.id,
        kelasId: kelasku[1].id,
        materiId: materiku[3].id,
        tanggal: new Date(),
        createdBy: "init",
      },
    ],
  });

  const jadwalku = await dbHonorarium.jadwal.findMany({
    where: {
      createdBy: "init",
    },
  });

  const jadwalNarasumber = await dbHonorarium.jadwalNarasumber.createMany({
    data: [
      {
        jadwalId: jadwalku[0].id,
        narasumberId: narasumberku[0].id,
        createdBy: "init",
      },
      {
        jadwalId: jadwalku[0].id,
        narasumberId: narasumberku[1].id,
        createdBy: "init",
      },
      {
        jadwalId: jadwalku[1].id,
        narasumberId: narasumberku[2].id,
        createdBy: "init",
      },
      {
        jadwalId: jadwalku[2].id,
        narasumberId: narasumberku[2].id,
        createdBy: "init",
      },
      {
        jadwalId: jadwalku[2].id,
        narasumberId: narasumberku[3].id,
        createdBy: "init",
      },
    ],
  });

  const pmkAcuan = await dbHonorarium.pmkAcuan.createMany({
    data: [
      {
        id: "2024",
        nomorPMK: "49/2023",
        tahun: 2024,
        aktif: true,
        createdBy: "init",
      },
    ],
  });

  const sbmHonorarium = await dbHonorarium.sbmHonorarium.createMany({
    data: [
      {
        tahun: 2024,
        jenis: " Narasumber",
        satuan: "OJ",
        besaran: 1700000,
        uraian:
          "Menteri/Pejabat Setingkat Menteri/Pejabat Negara Lainnya/yang disetarakan",
        createdBy: "init",
      },
      {
        tahun: 2024,
        jenis: " Narasumber",
        satuan: "OJ",
        besaran: 1400000,
        uraian: "Pejabat Eselon I/yang disetarakan",
        createdBy: "init",
      },
      {
        tahun: 2024,
        jenis: " Narasumber",
        satuan: "OJ",
        besaran: 1000000,
        uraian: "Pejabat Eselon II/yang disetarakan",
        createdBy: "init",
      },
      {
        tahun: 2024,
        jenis: " Narasumber",
        satuan: "OJ",
        besaran: 1000000,
        uraian: "Pejabat Eselon III ke bawah/yang disetarakan",
        createdBy: "init",
      },
      {
        tahun: 2024,
        jenis: " Moderator",
        satuan: "Orang/kali",
        besaran: 700000,
        uraian: "Pejabat Eselon III ke bawah/yang disetarakan",
        createdBy: "init",
      },
      {
        tahun: 2024,
        jenis: " Pembawa Acara",
        satuan: "OK",
        besaran: 400000,
        uraian: "Pejabat Eselon III ke bawah/yang disetarakan",
        createdBy: "init",
      },
      {
        tahun: 2024,
        jenis: "Panitia",
        satuan: "OK",
        besaran: 450000,
        uraian: "Penanggung Jawab",
        createdBy: "init",
      },
      {
        tahun: 2024,
        jenis: "Panitia",
        satuan: "OK",
        besaran: 400000,
        uraian: "Ketua/Wakil Ketua",
        createdBy: "init",
      },
      {
        tahun: 2024,
        jenis: "Panitia",
        satuan: "OK",
        besaran: 300000,
        uraian: "Sekretaris",
        createdBy: "init",
      },
      {
        tahun: 2024,
        jenis: "Panitia",
        satuan: "OK",
        besaran: 300000,
        uraian: "Anggota",
        createdBy: "init",
      },
    ],
  });

  const pejabat = await dbHonorarium.pejabat.createMany({
    data: [
      {
        id: 0,
        nama: "PEJABAT NEGARA",
        eselon: 0,
      },
      {
        id: 1,
        nama: "PEJABAT ESELON I",
        eselon: 1,
      },
      {
        id: 2,
        nama: "PEJABAT ESELON II",
        eselon: 2,
      },
      {
        id: 3,
        nama: "PEJABAT ESELON III",
        eselon: 3,
      },
      {
        id: 4,
        nama: "PEJABAT ESELON IV",
        eselon: 4,
      },
    ],
  });

  const sbmUangRepresentasi = await dbHonorarium.sbmUangRepresentasi.createMany(
    {
      data: [
        {
          tahun: 2024,
          pejabatId: 0,
          satuan: "OH",
          luarKota: 250000,
          dalamKota: 125000,
          createdBy: "init",
        },
        {
          tahun: 2024,
          pejabatId: 1,
          satuan: "OH",
          luarKota: 200000,
          dalamKota: 100000,
          createdBy: "init",
        },
        {
          tahun: 2024,
          pejabatId: 2,
          satuan: "OH",
          luarKota: 150000,
          dalamKota: 75000,
          createdBy: "init",
        },
      ],
    }
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await dbHonorarium.$disconnect();
  });
