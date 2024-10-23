"use server";
import { PesertaKegiatanLuarNegeri } from "@/actions/kegiatan/peserta/luar-negeri";
import { getSessionPenggunaForAction } from "@/actions/pengguna";
import { getPrismaErrorResponse } from "@/actions/prisma-error-response";
import { ActionResponse } from "@/actions/response";
import { dbHonorarium } from "@/lib/db-honorarium";
import {
  SbmUhLuarNegeri,
  STATUS_PENGAJUAN,
  UhLuarNegeri,
} from "@prisma-honorarium/client";
import { Logger } from "tslog";
import { updateStatusUhLuarNegeri } from "../proses";

const logger = new Logger({
  hideLogPositionForProduction: true,
});

const SetujuiPengajuanUhLuarNegeri = async (
  kegiatanId: string,
  pesertaKegiatan: PesertaKegiatanLuarNegeri[],
  detailUhLuarNegeriPeserta: DetailUhLuarNegeriPeserta[] | null
): Promise<ActionResponse<boolean>> => {
  logger.debug("SetujuiPengajuanUhLuarNegeri", kegiatanId);
  if (!detailUhLuarNegeriPeserta) {
    return {
      success: false,
      error: "E-SPUHDN-01",
      message: "Detail peserta uang harian luar negeri tidak ditemukan",
    };
  }
  //logger.debug("detailUhLuarNegeriPeserta", detailUhLuarNegeriPeserta);

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
    logger.debug("negara", negara);

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

    //logger.debug("sbm", sbm);

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

    let x = 0;
    const transactionUpdate = await dbHonorarium.$transaction(
      async (prisma) => {
        // iterate detailUhLuarNegeriPeserta
        for (const d of detailUhLuarNegeriPeserta) {
          const sbmNegara = sbm.find((s) => s.negaraId === d.keLokasiId);
          //hardcoded for IDN, do not UPDATE IDN
          if (!sbmNegara || d.keLokasiId === "IDN") {
            //logger.debug("detailUhLuarNegeriPeserta SKIP", d);
            continue;
          }

          if (d.jumlahHari === 0) {
            logger.debug("detailUhLuarNegeriPeserta SKIP", d);
            continue;
          }

          const golonganUh: GolonganKeys = ("golongan" + d.golonganUh ||
            "D") as GolonganKeys;
          //getNominalUhLuarNegeri
          const nominal = await getNominalUhLuarNegeri(sbmNegara, golonganUh);
          //logger.debug("getNominalUhLuarNegeri", nominal);
          if (!nominal) {
            continue;
          }

          const updated = await prisma.uhLuarNegeri.update({
            where: {
              id: d.id,
              pesertaKegiatanId: d.pesertaKegiatanId,
            },
            data: {
              nominalGolonganUh: Number(nominal),
              jumlahHari: d.jumlahHari,
              jamPerjalanan: d.jamPerjalanan,
              hPerjalanan: d.hPerjalanan,
              uhPerjalanan: nominal.times(d.hPerjalanan).times(0.4),
              hUangHarian: d.hUangHarian,
              uhUangHarian: nominal.times(d.jumlahHari),
              hDiklat: d.hDiklat,
              uhDiklat: nominal.times(d.jumlahHari).times(0.8),
              updatedAt: new Date(),
            },
          });
        }

        //update riwayat kegiatan
        //const updatedRiwayatPengajuan = await updateRiwayat

        return true;
      }
    );

    const updated = await updateStatusUhLuarNegeri(
      kegiatanId,
      STATUS_PENGAJUAN.APPROVED
    );

    logger.info("[SUCCESS SetujuiPengajuanUhLuarNegeri]", {
      transactionUpdate,
      updated,
    });

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

export interface DetailUhLuarNegeriPeserta extends UhLuarNegeri {
  nama: string;
  NIP: string | null;
  pangkatGolonganId: string | null;
  jabatan: string | null;
  eselon: string | null;
}

type GolonganKeys = "golonganA" | "golonganB" | "golonganC" | "golonganD";

export const getNominalUhLuarNegeri = async (
  sbm: SbmUhLuarNegeri,
  golonganUh: GolonganKeys
) => {
  const nominal = sbm[golonganUh];
  logger.debug("[getNominalUhLuarNegeri]", nominal);
  return nominal;
};

export default SetujuiPengajuanUhLuarNegeri;
