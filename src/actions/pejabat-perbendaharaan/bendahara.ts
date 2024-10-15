"use server";
import { dbHonorarium } from "@/lib/db-honorarium";
import { getSessionPenggunaForAction } from "../pengguna";

const getBendaharaSatker = (id: string) => {
  const bendahara = dbHonorarium.pejabatPerbendaharaan.findMany({
    where: {
      satkerId: id,
      tmtMulai: {
        lte: new Date(),
      },
      OR: [
        {
          tmtSelesai: {
            gte: new Date(),
          },
        },
        {
          tmtSelesai: null,
        },
      ],
    },
  });
  return bendahara;
};

export interface OptionPengelolaKeuangan {
  value: string;
  label: string;
  tanggalMulai?: string;
  tanggalSelesai: string | null;
}

export const getOptionsBendahara = async (): Promise<
  OptionPengelolaKeuangan[] | null
> => {
  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return null;
  }

  try {
    const satkerId = pengguna.data.satkerId;
    const bendahara = await getBendaharaSatker(satkerId);
    const options = bendahara.map((bendahara) => ({
      value: bendahara.id,
      label: bendahara.nama,
      tanggalMulai: bendahara.tmtMulai.toISOString(),
      tanggalSelesai: bendahara.tmtSelesai?.toISOString() ?? null,
    }));
    console.log("options", options);
    return options;
  } catch (error) {
    return null;
  }
};
