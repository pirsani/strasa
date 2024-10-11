"use server";
import { getSessionPenggunaForAction } from "@/actions/pengguna";
import { getPrismaErrorResponse } from "@/actions/prisma-error-response";
import { ActionResponse } from "@/actions/response";
import { dbHonorarium } from "@/lib/db-honorarium";
import { PesertaKegiatanDalamNegeri } from "../peserta/dalam-negeri";

const SetujuiPengajuanUhDalamNegeri = async (
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
    });

    if (!kegiatan || !kegiatan.lokasi || !kegiatan.provinsiId) {
      return {
        success: false,
        error: "Kegiatan tidak ditemukan",
      };
    }

    const lokasi = kegiatan.lokasi;
    const provinsi = kegiatan.provinsiId;

    // find SBM

    const sbm = await dbHonorarium.sbmUhDalamNegeri.findFirst({
      where: {
        provinsiId: provinsi,
      },
    });

    if (!sbm) {
      return {
        success: false,
        error: "SBM tidak ditemukan",
      };
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
                  uhFullboard: uhDalamNegeri.jumlahHari * Number(fullboard),
                  hFulldayHalfday: uhDalamNegeri.hFulldayHalfday,
                  uhFulldayHalfday:
                    uhDalamNegeri.jumlahHari * Number(fulldayHalfday),
                  hDalamKota: uhDalamNegeri.hDalamKota,
                  uhDalamKota: uhDalamNegeri.jumlahHari * Number(dalamKota),
                  hLuarKota: uhDalamNegeri.hLuarKota,
                  uhLuarKota: uhDalamNegeri.jumlahHari * Number(luarKota),
                  hDiklat: uhDalamNegeri.hDiklat,
                  uhDiklat: uhDalamNegeri.jumlahHari * Number(diklat),
                  hTransport: uhDalamNegeri.hTransport,
                  //uhTransport: uhDalamNegeri.uhTransport * Number(),
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

    // all peserta updated
    return {
      success: true,
      data: true,
    };
  } catch (error) {
    console.error("[ERROR SetujuiPengajuanUhDalamNegeri]", error);
    return getPrismaErrorResponse(error as Error);
  }
};

export default SetujuiPengajuanUhDalamNegeri;
