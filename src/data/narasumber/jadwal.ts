import { dbHonorarium } from "@/lib/db-honorarium";

export const getJadwalIncludeKegiatan = async (jadwalId: string) => {
  const kegiatan = await dbHonorarium.jadwal.findUnique({
    where: {
      id: jadwalId,
    },
    include: {
      kegiatan: {
        include: {
          satker: true,
          unitKerja: true,
        },
      },
    },
  });
  return kegiatan;
};
