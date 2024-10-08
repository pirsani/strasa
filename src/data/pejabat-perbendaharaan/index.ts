import { dbHonorarium } from "@/lib/db-honorarium";
import {
  JenisJabatanPerbendaharaan,
  Organisasi,
  PejabatPerbendaharaan,
} from "@prisma-honorarium/client";

export type PejabatPerbendaharaanWithStringDate = Omit<
  PejabatPerbendaharaan,
  "tmtMulai" | "tmtSelesai"
> & {
  tmtMulai: Date | string | null;
  tmtSelesai: Date | string | null;
  jabatan: JenisJabatanPerbendaharaan;
  satker: Organisasi;
};

interface PejabatPerbendaharaanBeforeConverted extends PejabatPerbendaharaan {
  jabatan: JenisJabatanPerbendaharaan;
  satker: Organisasi;
}
export const convertPejabatPerbendaharaanToStringDate = (
  data: PejabatPerbendaharaanBeforeConverted[]
) => {
  return data.map((item) => ({
    ...item,
    tmtMulai: item.tmtMulai
      ? new Date(item.tmtMulai).toISOString().slice(0, 10)
      : "",
    tmtSelesai: item.tmtSelesai
      ? new Date(item.tmtSelesai).toISOString().slice(0, 10)
      : "",
  }));
};

interface GetPejabatPerbenaharaanParams {
  satkerId?: string;
  status?: string;
  jabatanId?: string;
  // Add more parameters as needed
}
export const getPejabatPerbenaharaanBySatkerId = async (
  params: GetPejabatPerbenaharaanParams
) => {
  const whereClause: { [key: string]: any } = {};
  if (params.satkerId) {
    whereClause.satkerId = params.satkerId;
  }

  // // Add conditions for active pejabat
  // whereClause.tmtMulai = {
  //   gte: new Date(),
  // };
  // whereClause.OR = [
  //   {
  //     tmtSelesai: null,
  //   },
  //   {
  //     tmtSelesai: {
  //       gte: new Date(),
  //     },
  //   },
  // ];

  const pejabatPerbendaharaan =
    await dbHonorarium.pejabatPerbendaharaan.findMany({
      where: whereClause,
      include: {
        satker: true,
        jabatan: true,
      },
    });

  return pejabatPerbendaharaan;
};

export const getJenisJabatanPerbendaharaan = async () => {
  const dataJenisJabatanPerbendaharaan =
    await dbHonorarium.jenisJabatanPerbendaharaan.findMany({});
  return dataJenisJabatanPerbendaharaan;
};
