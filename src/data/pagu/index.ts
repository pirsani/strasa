import { dbHonorarium } from "@/lib/db-honorarium";
import { Organisasi, Pagu } from "@prisma-honorarium/client";

const getPaguSatker = () => {
  return null;
};

interface UnitKerjaIncludeIndukOrganisasi extends Organisasi {
  indukOrganisasi: Organisasi | null;
}

export interface PaguUnitKerja extends Pagu {
  unitKerja: UnitKerjaIncludeIndukOrganisasi;
}

export const getPaguUnitKerjaBySatker = async (
  satkerId: string,
  tahun: number
): Promise<PaguUnitKerja[] | null> => {
  const pagu = await dbHonorarium.pagu.findMany({
    where: {
      unitKerja: {
        OR: [{ indukOrganisasiId: satkerId }, { id: satkerId }],
      },
      tahun,
    },
    include: {
      unitKerja: {
        include: {
          indukOrganisasi: true,
        },
      },
    },
  });
  return pagu;
};

export const getPagu = async (id: string): Promise<PaguUnitKerja | null> => {
  const pagu = await dbHonorarium.pagu.findFirst({
    where: {
      id,
    },
    include: {
      unitKerja: {
        include: {
          indukOrganisasi: true,
        },
      },
    },
  });
  return pagu;
};

export const getPaguUnitKerja = async (
  unitKerjaId: string,
  tahun: number
): Promise<PaguUnitKerja | null> => {
  const pagu = await dbHonorarium.pagu.findFirst({
    where: {
      tahun,
      unitKerjaId,
    },
    include: {
      unitKerja: {
        include: {
          indukOrganisasi: true,
        },
      },
    },
  });
  return pagu;
};

interface ResultPaguRealisasi {
  year: number;
  unit_kerja_id: string;
  nama: string;
  singkatan: string;
  realisasi: number;
  pagu: number;
  sisa: number;
}
export const getPaguRealisasiUnitKerjaBySatker = async (
  tahun: number,
  satkerId: string
) => {
  const result = await dbHonorarium.$queryRaw<ResultPaguRealisasi[]>`
    select * from get_pagu_realisasi(${tahun},${satkerId})
  `;
  return result;
};
