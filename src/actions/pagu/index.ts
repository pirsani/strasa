"use server";
import {
  getPagu,
  getSumPaguUnitKerjaBySatker,
  PaguUnitKerja,
} from "@/data/pagu";
import { dbHonorarium } from "@/lib/db-honorarium";
import formatCurrency from "@/utils/format-currency";
import { Pagu as ZPagu } from "@/zod/schemas/pagu";
import { createId } from "@paralleldrive/cuid2";
import { Logger } from "tslog";
import { getSessionPenggunaForAction } from "../pengguna";
import { getTahunAnggranPilihan } from "../pengguna/preference";
import { getPrismaErrorResponse } from "../prisma-error-response";
import { ActionResponse } from "../response";
export type { PaguUnitKerja };

const logger = new Logger({
  name: "action-pagu",
  hideLogPositionForProduction: true,
});

export const simpanDataPagu = async (
  data: ZPagu
): Promise<ActionResponse<PaguUnitKerja>> => {
  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return pengguna;
  }

  try {
    const { id, unitKerjaId, pagu } = data;

    if (!pagu || pagu < 0n) {
      return {
        success: false,
        error: "Pagu tidak boleh kurang dari 0",
        message: "Pagu tidak boleh kurang dari 0",
      };
    }
    const org = await dbHonorarium.organisasi.findFirst({
      where: {
        id: unitKerjaId,
      },
    });

    if (!org) {
      // it should never happen
      logger.error("Fatal Error, Unit Kerja not found");
      return {
        success: false,
        error: "E-P404",
        message: "Unit Kerja tidak ditemukan",
      };
    }

    const tahun = await getTahunAnggranPilihan();
    const satkerId = pengguna.data.satkerId; // TODO : ignore satker if superadmin

    const paguSatker = await dbHonorarium.pagu.findFirst({
      where: {
        unitKerjaId: satkerId,
      },
    });

    const sumPaguUnitKerjaExistings: bigint = await getSumPaguUnitKerjaBySatker(
      tahun,
      satkerId,
      unitKerjaId
    );

    // console.log("paguSatker", paguSatker);

    // if newly data is satker, it should not less than sum of all unit kerja
    // if newly data is unit kerja non satker anggaran , sumPaguUnitKerjaExistings + newPagu should not more than paguSatker
    const totalAfterUpdate = sumPaguUnitKerjaExistings + pagu;
    console.log(
      "[pagu before update]",
      org.isSatkerAnggaran,
      sumPaguUnitKerjaExistings,
      pagu,
      totalAfterUpdate
    );

    // pengecekan pagu satker
    if (org.isSatkerAnggaran && sumPaguUnitKerjaExistings > pagu) {
      const formattedPagu = formatCurrency(Number(pagu));
      const formattedSumPagu = formatCurrency(
        Number(sumPaguUnitKerjaExistings)
      );
      return {
        success: false,
        error: "E-PAGU-LT01",
        message: `Pagu Satker = ${formattedPagu} lebih kecil dari total pagu unit organisasi bawahnya = ${formattedSumPagu}`,
      };
    }

    if (!org.isSatkerAnggaran) {
      if (!paguSatker) {
        return {
          success: false,
          error: "E-PSA-NA01",
          message: "Pagu Satker Anggaran harus diisi terlebih dahulu",
        };
      } else if (totalAfterUpdate > paguSatker.pagu) {
        const formattedMaksimumPagu = formatCurrency(
          Number(paguSatker.pagu - sumPaguUnitKerjaExistings)
        );
        const formattedPagu = formatCurrency(Number(paguSatker.pagu));
        return {
          success: false,
          error: "E-PAGU-GT01",
          message: `Total pagu unit kerja lebih besar dari pagu satker ${formattedPagu}, maksimum pagu yang bisa diinputkan adalah ${formattedMaksimumPagu}`,
        };
      }
    }

    //const unitKerjaId = pengguna.data.unitKerjaId;
    const penggunaId = pengguna.data.penggunaId;

    const upsertedPagu: PaguUnitKerja = await dbHonorarium.pagu.upsert({
      where: {
        id: id ?? createId(),
      },
      create: {
        unitKerjaId,
        tahun,
        pagu: pagu ?? 0,
        createdBy: penggunaId,
      },
      update: {
        pagu: pagu ?? 0,
        updatedBy: penggunaId,
        updatedAt: new Date(),
      },
      include: {
        unitKerja: {
          include: {
            indukOrganisasi: true,
          },
        },
      },
    });

    //console.log("upsertedPagu", upsertedPagu);

    if (!upsertedPagu) {
      return {
        success: false,
        error: "Pagu tidak ditemukan",
        message: "Pagu tidak ditemukan",
      };
    }

    return {
      success: true,
      data: upsertedPagu,
    };
  } catch (error) {
    const prismaError = getPrismaErrorResponse(error as Error);
    console.error(prismaError.message);
    return prismaError;
  }
};

export const hapusDataPagu = async (
  id: string
): Promise<ActionResponse<PaguUnitKerja>> => {
  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return pengguna;
  }

  const satkerId = pengguna.data.satkerId;
  //const unitKerjaId = pengguna.data.unitKerjaId;
  const penggunaId = pengguna.data.penggunaId;
  const tahun = await getTahunAnggranPilihan();
  const tobeDeleted = await getPagu(id);

  const deleted = await dbHonorarium.pagu.delete({
    where: {
      id,
    },
  });

  if (!deleted || !tobeDeleted) {
    return {
      success: false,
      error: "Pagu tidak ditemukan",
      message: "Pagu tidak ditemukan",
    };
  }

  return {
    success: true,
    data: tobeDeleted,
  };
};
