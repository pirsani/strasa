"use server";

import { getSessionPenggunaForAction } from "@/actions/pengguna";
import { ActionResponse } from "@/actions/response";
import { getJadwalById, JadwalKelasNarasumber } from "@/data/jadwal";
import { dbHonorarium } from "@/lib/db-honorarium";
import { Jadwal } from "@/zod/schemas/jadwal";
import { createId } from "@paralleldrive/cuid2";
import { getPrismaErrorResponse } from "../prisma-error-response";

import { revalidatePath } from "next/cache";
import { Logger } from "tslog";
// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

export const SimpanJadwalKelasNarasumber = async (
  jadwal: Jadwal
): Promise<ActionResponse<JadwalKelasNarasumber>> => {
  logger.info("[JADWAL]", jadwal);

  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return pengguna;
  }

  const satkerId = pengguna.data.satkerId;
  const unitKerjaId = pengguna.data.unitKerjaId;
  const penggunaId = pengguna.data.penggunaId;
  try {
    const transactionJadwal = await dbHonorarium.$transaction(
      async (prisma) => {
        const jadwalUpsert = await prisma.jadwal.upsert({
          where: { id: jadwal.id || createId() },
          update: {
            materiId: jadwal.materiId,
            kelasId: jadwal.kelasId,
            jumlahJamPelajaran: jadwal.jumlahJamPelajaran,
            tanggal: jadwal.tanggal,
            updatedBy: penggunaId,
            updatedAt: new Date(),
          },
          create: {
            id: jadwal.id,
            kegiatanId: jadwal.kegiatanId,
            materiId: jadwal.materiId,
            kelasId: jadwal.kelasId,
            jumlahJamPelajaran: jadwal.jumlahJamPelajaran,
            tanggal: jadwal.tanggal,
            createdBy: penggunaId,
            createdAt: new Date(),
          },
        });

        for (const narasumberId of jadwal.narasumberIds) {
          await prisma.jadwalNarasumber.upsert({
            where: {
              jadwalId_narasumberId: {
                jadwalId: jadwalUpsert.id,
                narasumberId: narasumberId,
              },
            },
            update: {
              updatedBy: penggunaId,
              updatedAt: new Date(),
            },
            create: {
              jadwalId: jadwalUpsert.id,
              narasumberId: narasumberId,
              createdBy: penggunaId,
              createdAt: new Date(),
            },
          });
        }

        return jadwalUpsert;
      }
    );

    const jadwalKelasNarasumber = await getJadwalById(transactionJadwal.id);

    if (!jadwalKelasNarasumber) {
      return {
        success: false,
        error: "Error saving data",
      };
    }

    revalidatePath("/pengajuan");
    return {
      success: true,
      data: jadwalKelasNarasumber,
    };
  } catch (error) {
    return {
      success: false,
      error: "Error saving data",
    };
  }
};

export const deleteJadwalKelasNarasumber = async (
  jadwalId: string
): Promise<ActionResponse<boolean>> => {
  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return pengguna;
  }

  const satkerId = pengguna.data.satkerId;
  const unitKerjaId = pengguna.data.unitKerjaId;
  const penggunaId = pengguna.data.penggunaId;

  try {
    const transaction = dbHonorarium.$transaction(async (prisma) => {
      await prisma.jadwalNarasumber.deleteMany({
        where: {
          jadwalId: jadwalId,
        },
      });

      await prisma.jadwal.delete({
        where: {
          id: jadwalId,
        },
      });
    });
    return {
      success: true,
      data: true,
    };
  } catch (error) {
    return getPrismaErrorResponse(error as Error);
  }
};

export default SimpanJadwalKelasNarasumber;
