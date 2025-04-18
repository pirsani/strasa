"use server";
import { auth } from "@/auth";
import { dbHonorarium } from "@/lib/db-honorarium";
import { createId } from "@paralleldrive/cuid2";
import { Logger } from "tslog";
// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

export const setTahunAnggaran = async (tahunAnggaran: number) => {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    throw new Error("Unauthorized");
  }

  try {
    const userId = session.user.id;
    logger.debug("tahunAnggaran", tahunAnggaran);

    const data = await dbHonorarium.userPreference.upsert({
      where: {
        id: userId || createId(),
      },
      create: {
        id: userId,
        tahunAnggaran,
      },
      update: {
        tahunAnggaran,
      },
    });
    return tahunAnggaran;
  } catch (error) {
    logger.error("error", error);
    return 0;

    //throw new Error("Failed to set tahun anggaran");
  }
};

export const getTahunAnggaranPilihan = async () => {
  try {
    let tahunAnggaran = new Date().getFullYear();
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const data = await dbHonorarium.userPreference.findUnique({
      where: {
        id: userId || "falback-id",
      },
    });

    // if not found, set the default year
    if (!data) {
      tahunAnggaran = await setTahunAnggaran(tahunAnggaran);
    } else {
      tahunAnggaran = data.tahunAnggaran;
    }
    console.log("getTahunAnggaranPilihan", "tahunAnggaran", tahunAnggaran);
    return tahunAnggaran;
  } catch (error) {
    console.error("error getTahunAnggaranPilihan", "tahunAnggaran", error);
    throw new Error("Failed to get tahun anggaran");
  }
};

export default setTahunAnggaran;
