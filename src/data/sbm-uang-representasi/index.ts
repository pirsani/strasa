import { dbHonorarium } from "@/lib/db-honorarium";
import { SbmUangRepresentasi } from "@prisma-honorarium/client";

export interface sbmUangRepresentasiWithPejabat extends SbmUangRepresentasi {
  pejabat: {
    id: number;
    nama: string;
  };
}
export const getSbmUangRepresentasi = async (tahunAnggaran?: number) => {
  const tahun = tahunAnggaran || new Date().getFullYear();
  const dataSbmUangRepresentasi =
    await dbHonorarium.sbmUangRepresentasi.findMany({
      where: {
        tahun: tahun,
      },
      include: {
        pejabat: true,
      },
    });
  return dataSbmUangRepresentasi;
};
