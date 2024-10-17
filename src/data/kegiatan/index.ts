import { Jadwal, Kegiatan, Organisasi } from "@prisma-honorarium/client";

interface KegiatanIncludeSatker extends Kegiatan {
  satker: Organisasi;
  unitKerja: Organisasi;
}

interface JadwalIncludeKegiatan extends Jadwal {
  kegiatan: KegiatanIncludeSatker;
}
