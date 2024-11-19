import { dbHonorarium } from "@/lib/db-honorarium";
import { Organisasi, Sp2d } from "@prisma-honorarium/client";

const getSp2dSatker = () => {
  return null;
};

interface UnitKerjaIncludeIndukOrganisasi extends Organisasi {
  indukOrganisasi: Organisasi | null;
}

export interface Sp2dUnitKerja extends Sp2d {
  unitKerja: UnitKerjaIncludeIndukOrganisasi;
}

export const getSp2dUnitKerjaBySatker = async (
  satkerId: string,
  tahun: number
): Promise<Sp2dUnitKerja[] | null> => {
  const sp2d = await dbHonorarium.sp2d.findMany({
    where: {
      unitKerja: {
        OR: [{ indukOrganisasiId: satkerId }, { id: satkerId }],
      },
      tanggal: {
        gte: new Date(tahun, 0, 1),
        lte: new Date(tahun, 11, 31),
      },
    },
    include: {
      unitKerja: {
        include: {
          indukOrganisasi: true,
        },
      },
    },
  });
  return sp2d;
};

export const getSp2d = async (id: string): Promise<Sp2dUnitKerja | null> => {
  const sp2d = await dbHonorarium.sp2d.findFirst({
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
  return sp2d;
};

export const getSp2dUnitKerja = async (
  unitKerjaId: string,
  tahun: number
): Promise<Sp2dUnitKerja | null> => {
  const sp2d = await dbHonorarium.sp2d.findFirst({
    where: {
      tanggal: {
        gte: new Date(tahun, 0, 1),
        lte: new Date(tahun, 11, 31),
      },
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
  return sp2d;
};
