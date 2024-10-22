"use server";
import { getSessionPenggunaForAction } from "@/actions/pengguna";
import { getPrismaErrorResponse } from "@/actions/prisma-error-response";
import { ActionResponse } from "@/actions/response";
import { dbHonorarium } from "@/lib/db-honorarium";
import { Logger } from "tslog";
import { PesertaKegiatanLuarNegeri } from "../peserta/luar-negeri";

const logger = new Logger({
  hideLogPositionForProduction: true,
});

const SetujuiPengajuanUhLuarNegeri = async (
  kegiatanId: string,
  pesertaKegiatan: PesertaKegiatanLuarNegeri[]
): Promise<ActionResponse<boolean>> => {
  try {
    const pengguna = await getSessionPenggunaForAction();
    if (!pengguna.success) {
      return pengguna;
    }

    const satkerId = pengguna.data.satkerId;
    const unitKerjaId = pengguna.data.unitKerjaId;
    const penggunaId = pengguna.data.penggunaId;

    const kegiatan = await dbHonorarium.kegiatan.findFirst({
      where: {
        id: kegiatanId,
      },
      include: {
        itinerary: true,
      },
    });

    if (!kegiatan || !kegiatan.lokasi) {
      logger.info("E-SPUHDN-01", kegiatan);
      return {
        success: false,
        error: "E-SPUHDN-01",
        message: `Kegiatan tidak ditemukan / lokasi tidak ditemukan`,
      };
    }

    const lokasi = kegiatan.lokasi;

    const negaraInItinerary = kegiatan.itinerary.map((it) => it.keLokasiId);
    // filter IDN because it's not a foreign country
    const negara = negaraInItinerary.filter((n) => n !== "IDN");

    // find SBM that exist in itinerary
    const tahunSbm = kegiatan.tanggalMulai.getFullYear();
    const sbm = await dbHonorarium.sbmUhLuarNegeri.findMany({
      where: {
        tahun: tahunSbm,
        negaraId: {
          in: negara,
        },
      },
    });

    logger.debug("sbm", sbm);

    if (!sbm || sbm.length === 0) {
      const error = `E-SBMUHDN-01`;
      const message = `SBM Uang Harian tahun ${tahunSbm} tidak ditemukan, silakan impor data SBM Uang Harian terlebih dahulu.`;
      logger.error(error, message);
      return {
        success: false,
        error,
        message,
      };
    }

    // notify which SBM that not found
    const notFoundSbm = negara.filter(
      (n) => !sbm.find((s) => s.negaraId === n)
    );
    if (notFoundSbm.length > 0) {
      const error = `E-SBMUHDN-02`;
      const message = `SBM Uang Harian tahun ${tahunSbm} negara ${notFoundSbm.join(
        ", "
      )} tidak ditemukan, silakan impor data SBM Uang Harian terlebih dahulu.`;
      logger.error(error, message);
      return {
        success: false,
        error,
        message,
      };
    }

    const transactionUpdate = await dbHonorarium.$transaction(
      async (prisma) => {
        const peserta = pesertaKegiatan.map(async (p) => {
          const uhLuarNegeri = p.uhLuarNegeri;
          if (uhLuarNegeri) {
            // iterate through each uhLuarNegeri
            // update status to approved

            for (const uh of uhLuarNegeri) {
              const sbmNegara = sbm.find((s) => s.negaraId === uh.keLokasiId);
              logger.debug("negaraId sbmNegara ", uh.keLokasiId, sbmNegara);
              const updateEachUh = await prisma.uhLuarNegeri.update({
                where: {
                  id: uh.id,
                },
                data: {
                  updatedAt: new Date(),
                },
              });
              // logger.debug("[SetujuiPengajuanUhLuarNegeri] updateEachUh", {
              //   updateEachUh,
              // });
            }

            //return updatedUhLuarNegeriPerPeserta;
          }
          // insert your logic here
        });

        await Promise.all(peserta);
        return peserta;
      }
    );

    // update riwayat kegiatan
    //const updatedRiwayatPengajuan = await updateRiwayat

    // const updated = await updateStatusUhLuarNegeri(
    //   kegiatanId,
    //   STATUS_PENGAJUAN.APPROVED
    // );

    // logger.info("[SUCCESS SetujuiPengajuanUhLuarNegeri]", {
    //   transactionUpdate,
    //   updated,
    // });

    // all peserta updated
    return {
      success: true,
      data: true,
    };
  } catch (error) {
    console.error("[ERROR SetujuiPengajuanUhLuarNegeri]", error);
    return getPrismaErrorResponse(error as Error);
  }
};

export default SetujuiPengajuanUhLuarNegeri;
