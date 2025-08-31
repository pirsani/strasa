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

export interface ResultPaguRealisasi {
  year: number;
  unit_kerja_id: string;
  nama: string;
  singkatan: string;
  realisasi: bigint;
  pagu: bigint;
  sisa: bigint;
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

export const getPaguRealisasiUnitKerjaBySatker = async (
  tahun: number,
  satkerId: string
) => {
  // cast tahun to integer
  console.log("[getPaguRealisasiUnitKerjaBySatker]", tahun, satkerId);
  const result = await dbHonorarium.$queryRaw<ResultPaguRealisasi[]>`
    select * from get_pagu_realisasi(${tahun}::integer,${satkerId})
  `;
  return result;
};

export const getSumPaguUnitKerjaBySatker = async (
  tahun: number,
  satkerId: string,
  exludeId?: string
): Promise<bigint> => {
  const result = await dbHonorarium.$queryRaw<[{ sum: bigint | null }]>`
    select sum(p.pagu) from pagu p 
    inner join organisasi o ON p.unit_kerja_id = o.id 
    where o.induk_organisasi_id = ${satkerId} 
    and p.tahun = ${tahun}
    and o.id != ${exludeId}
  `;
  //console.log("[getSumPaguUnitKerjaBySatker]", result);
  return BigInt(result[0].sum ?? 0);
};
