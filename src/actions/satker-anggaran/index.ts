"use server";
import { ActionResponse } from "@/actions/response";
import { dbHonorarium } from "@/lib/db-honorarium";
import { SatkerAnggaran as ZSatkerAnggaran } from "@/zod/schemas/satker-anggaran";
import { Organisasi as SatkerAnggaran } from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";

// pada prinsipnya, Satker anggaran adalah unit kerja dalam organisasi yang memiliki anggaran

export interface satkerAnggaranWithPejabatPengelolaKeuangan
  extends SatkerAnggaran {}
export const getSatkerAnggaran = async (satkerAnggaran?: string) => {
  const dataSatkerAnggaran = await dbHonorarium.organisasi.findMany({
    where: {
      isSatkerAnggaran: true,
    },
  });
  return dataSatkerAnggaran;
};

// hanya akan memberi flag isSatkerAnggaran pada unit kerja yang dipilih

export const setSatkerAnggaran = async (
  data: ZSatkerAnggaran,
  id: string
): Promise<ActionResponse<SatkerAnggaran>> => {
  try {
    const satkerAnggaranBaru = await dbHonorarium.organisasi.update({
      where: {
        id: id,
      },
      data: {
        ...data,
        updatedBy: "admin",
      },
    });
    revalidatePath("/data-referensi/satkerAnggaran");
    return {
      success: true,
      data: satkerAnggaranBaru,
    };
  } catch (error) {
    return {
      success: false,
      error: "Not implemented",
      message: "Not implemented",
    };
  }
};

export const deleteSatkerAnggaran = async (
  id: string
): Promise<ActionResponse<SatkerAnggaran>> => {
  try {
    const satkerAnggaranBaru = await dbHonorarium.organisasi.update({
      where: {
        id: id,
      },
      data: {
        isSatkerAnggaran: false,
        updatedBy: "admin",
      },
    });
    revalidatePath("/data-referensi/satkerAnggaran");
    return {
      success: true,
      data: satkerAnggaranBaru,
    };
  } catch (error) {
    return {
      success: false,
      error: "Not implemented",
      message: "Not implemented",
    };
  }
};

export const getOptionsSatkerAnggaran = async () => {
  const dataSatkerAnggaran = await dbHonorarium.organisasi.findMany({
    include: {
      indukOrganisasi: true,
    },
  });
  // map dataSatkerAnggaran to options
  const optionsSatkerAnggaran = dataSatkerAnggaran.map((satkerAnggaran) => {
    const label = satkerAnggaran.nama;
    return {
      label: label,
      value: satkerAnggaran.id,
    };
  });

  return optionsSatkerAnggaran;
};

export const getOptionsForEligibleSatkerAnggaran = async () => {
  const dataUnitOrganisasiEligibleForSatkerAnggaran =
    await dbHonorarium.organisasi.findMany({
      where: {
        isSatkerAnggaran: false,
        eselon: {
          lte: 2,
          gte: 1,
        },
      },
    });
  // map dataSatkerAnggaran to options
  const optionsEligibleSatkerAnggaran =
    dataUnitOrganisasiEligibleForSatkerAnggaran.map((unit) => {
      const label = unit.nama;
      return {
        label: label,
        value: unit.id,
      };
    });

  return optionsEligibleSatkerAnggaran;
};
