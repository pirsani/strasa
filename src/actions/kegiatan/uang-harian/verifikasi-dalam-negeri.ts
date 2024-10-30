"use server";
import { getSessionPenggunaForAction } from "@/actions/pengguna";
import { getPrismaErrorResponse } from "@/actions/prisma-error-response";
import { ActionResponse } from "@/actions/response";
import { dbHonorarium } from "@/lib/db-honorarium";
import { STATUS_PENGAJUAN } from "@prisma-honorarium/client";
import Decimal from "decimal.js";
import { Logger } from "tslog";
import { PesertaKegiatanDalamNegeri } from "../peserta/dalam-negeri";
import { updateStatusUhDalamNegeri } from "../proses";

const logger = new Logger({
  hideLogPositionForProduction: true,
});

const setujuiPengajuanUhDalamNegeri = async (
  kegiatanId: string,
  pesertaKegiatan: PesertaKegiatanDalamNegeri[]
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
        provinsi: true,
      },
    });

    if (!kegiatan || !kegiatan.lokasi || !kegiatan.provinsiId) {
      logger.info("E-SPUHDN-01", kegiatan);
      return {
        success: false,
        error: "E-SPUHDN-01",
        message: `Kegiatan tidak ditemukan / lokasi tidak ditemukan/ provinsi tidak ditemukan`,
      };
    }

    const lokasi = kegiatan.lokasi;
    const provinsi = kegiatan.provinsiId;

    // find SBM
    const tahunSbm = kegiatan.tanggalMulai.getFullYear();
    const sbm = await dbHonorarium.sbmUhDalamNegeri.findFirst({
      where: {
        provinsiId: provinsi,
        tahun: tahunSbm,
      },
    });

    if (!sbm) {
      const error = `E-SBMUHDN-01`;
      const message = `SBM Uang Harian ${kegiatan.provinsi?.nama} tahun ${tahunSbm} tidak ditemukan, silakan impor data SBM Uang Harian terlebih dahulu.`;
      logger.error(error, message);
      return {
        success: false,
        error,
        message,
      };
    }

    let besaranSbmTransport = new Decimal(0);
    if (lokasi === "DALAM_KOTA") {
      const sbmTransportDalamKota =
        await dbHonorarium.sbmTransporDalamKotaPulangPergi.findFirst({
          where: {
            tahun: tahunSbm,
          },
        });

      if (!sbmTransportDalamKota) {
        const error = `E-SBMUHDN-02`;
        const message = `SBM Transport Dalam Kota tahun ${tahunSbm} tidak ditemukan`;
        logger.error(error, message);
        return {
          success: false,
          error:
            "SBM Transport Dalam Kota tidak ditemukan, silakan masukkan data SBM Transpor Dalam Kota terlebih dahulu.",
        };
      }

      besaranSbmTransport = sbmTransportDalamKota.besaran;
    }

    const { fullboard, fulldayHalfday, luarKota, dalamKota, diklat } = sbm;

    const transactionUpdate = await dbHonorarium.$transaction(
      async (prisma) => {
        const peserta = pesertaKegiatan.map(async (p) => {
          const uhDalamNegeri = p.uhDalamNegeri;
          if (uhDalamNegeri) {
            const updatedUhDalamNegeriPerPeserta =
              await prisma.uhDalamNegeri.update({
                data: {
                  jumlahHari: uhDalamNegeri.jumlahHari,
                  hFullboard: uhDalamNegeri.hFullboard,
                  uhFullboard: uhDalamNegeri.hFullboard * Number(fullboard),
                  hFulldayHalfday: uhDalamNegeri.hFulldayHalfday,
                  uhFulldayHalfday:
                    uhDalamNegeri.hFullboard * Number(fulldayHalfday),
                  hDalamKota: uhDalamNegeri.hDalamKota,
                  uhDalamKota: uhDalamNegeri.hDalamKota * Number(dalamKota),
                  hLuarKota: uhDalamNegeri.hLuarKota,
                  uhLuarKota: uhDalamNegeri.hLuarKota * Number(luarKota),
                  hDiklat: uhDalamNegeri.hDiklat,
                  uhDiklat: uhDalamNegeri.hDiklat * Number(diklat),
                  hTransport: uhDalamNegeri.hTransport,
                  uhTransport:
                    uhDalamNegeri.hTransport * Number(besaranSbmTransport),
                  verifiedBy: penggunaId,
                  verifiedAt: new Date(),
                },
                where: {
                  id: uhDalamNegeri.id,
                },
              });
            return updatedUhDalamNegeriPerPeserta;
          }
          // insert your logic here
        });

        await Promise.all(peserta);
        return peserta;
      }
    );

    // update riwayat kegiatan
    //const updatedRiwayatPengajuan = await updateRiwayat

    const updated = await updateStatusUhDalamNegeri(
      kegiatanId,
      STATUS_PENGAJUAN.APPROVED
    );

    logger.info("[SUCCESS setujuiPengajuanUhDalamNegeri]", {
      transactionUpdate,
      updated,
    });

    // all peserta updated
    return {
      success: true,
      data: true,
    };
  } catch (error) {
    console.error("[ERROR setujuiPengajuanUhDalamNegeri]", error);
    return getPrismaErrorResponse(error as Error);
  }
};

export default setujuiPengajuanUhDalamNegeri;
