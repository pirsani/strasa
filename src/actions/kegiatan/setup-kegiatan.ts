"use server";
import { ErrorResponseSwitcher } from "@/actions/lib";
import { ActionResponse } from "@/actions/response";
import { BASE_PATH_UPLOAD } from "@/app/api/upload/config";
import {
  emptyAllowed,
  columns as extractFromColumns,
} from "@/constants/excel/peserta";
import { dbHonorarium, Prisma } from "@/lib/db-honorarium";
import { ParseExcelResult } from "@/utils/excel/parse-excel";
import parseExcelOnServer from "@/utils/excel/parse-excel-on-server";
import { splitEmptyValues } from "@/utils/excel/split-empty-values";
import { Itinerary as ZItinerary } from "@/zod/schemas/itinerary";
import { Kegiatan as ZKegiatan } from "@/zod/schemas/kegiatan";
import { Kegiatan } from "@prisma-honorarium/client";
import fs from "fs";
import fse from "fs-extra";
import path from "path";
import { Logger } from "tslog";
import {
  copyLogUploadedFileToDokumenKegiatan,
  saveDokumenKegiatanToFinalFolder,
} from "../file";
import { getSessionPenggunaForAction } from "../pengguna";
// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

export const setupKegiatan = async (
  kegiatan: ZKegiatan
): Promise<ActionResponse<Kegiatan>> => {
  // get satkerId and unitKerjaId from the user

  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return pengguna;
  }

  const satkerId = pengguna.data.satkerId;
  const unitKerjaId = pengguna.data.unitKerjaId;
  const penggunaId = pengguna.data.penggunaId;

  const cuid = kegiatan.cuid; // this is the cuid of the kegiatan yang akan digunakan untuk referensi file yang telah diupload

  // step 1: get the data from the excel file
  let dataPesertaDariExcel: ParseExcelResult;
  // step 2: parse the xlsx file
  try {
    // parse xlsx file yang berisi data peserta yang telah diupload oleh user
    // cuidFolder dan cuidFile akan digunakan untuk menyimpan file di server
    // get file from file in folder with cuid
    const pesertaXlsxCuid = kegiatan.pesertaXlsxCuid;

    // add the file extension
    const filePesertaXlsx = `${pesertaXlsxCuid}`;
    const excelFilePath = path.posix.join(
      BASE_PATH_UPLOAD,
      "temp",
      cuid,
      filePesertaXlsx
    );

    // check if the file exists
    logger.info("excelFilePath", filePesertaXlsx);

    const filePesertaXlsxPathResolvedPath = path.resolve(excelFilePath);

    if (!fs.existsSync(filePesertaXlsxPathResolvedPath)) {
      return {
        success: false,
        error: "E-KEG-02",
        message: "File peserta tidak ditemukan",
      };
    }

    // read file as File
    const pesertaXlsx = fs.readFileSync(filePesertaXlsxPathResolvedPath);

    dataPesertaDariExcel = await parseDataPesertaDariExcel(pesertaXlsx);
  } catch (error) {
    console.error("Error parsing xlsx file:", error);
    return {
      success: false,
      error: "Error parsing xlsx file",
      message: "Data peserta tidak valid",
    };
  }

  // step 3: save the data to the database
  // data ready to be saved
  try {
    const kegiatanBaru = await dbHonorarium.$transaction(async (prisma) => {
      // Create the main kegiatan entry
      const kegiatanBaru = await createKegiatan(
        prisma,
        kegiatan,
        satkerId,
        unitKerjaId,
        penggunaId
      );
      // insert peserta dari excel
      const peserta = await insertPesertaDariExcel(
        prisma,
        kegiatanBaru.id,
        dataPesertaDariExcel.rows,
        penggunaId
      );

      // Handle the documents for surat tugas
      // const suratTugas = await insertDokumenSuratTugas(
      //   prisma,
      //   kegiatanBaru.id,
      //   kegiatan,
      //   penggunaId
      // );

      // const insertedDokumenKegiatan = await insertDokumenKegiatan(
      //   prisma,
      //   kegiatanBaru.id,
      //   kegiatan,
      //   penggunaId
      // );

      // if kegiatan.lokasi === "LUAR_NEGERI" then insert itinerary
      if (kegiatan.lokasi === "LUAR_NEGERI" && kegiatan.itinerary) {
        const insertedItinerary = await insertItinerary(
          prisma,
          kegiatan.itinerary as ZItinerary[],
          kegiatanBaru.id,
          penggunaId
        );
      }

      return kegiatanBaru;
    });

    // move the file to the final folder
    const logUploadedFile = await saveDokumenKegiatanToFinalFolder(
      kegiatan,
      kegiatanBaru.id
    );

    if (logUploadedFile.length === 0) {
      return {
        success: false,
        error: "E-FSK01", // no file found in temp folder
        message: "No File Found",
      };
    }

    await copyLogUploadedFileToDokumenKegiatan(
      logUploadedFile,
      pengguna.data.penggunaId
    );

    return {
      success: true,
      data: kegiatanBaru,
    };
  } catch (error) {
    return ErrorResponseSwitcher(error);

    //return getPrismaErrorResponse(error as Error);
    // return {
    //   success: false,
    //   error: "Error saving kegiatan",
    //   message: "Error saving kegiatan",
    // };
  }
};

const moveFolderToFinalLocation = async (
  fromCuid: string,
  toKegiatanFolder: string
) => {
  // move the folder to the final location
  const tempFolder = path.posix.join(BASE_PATH_UPLOAD, "temp", fromCuid);
  const finalFolder = path.posix.join(BASE_PATH_UPLOAD, toKegiatanFolder);
  try {
    // Ensure the final folder exists
    await fse.ensureDir(finalFolder);

    // Move the tempFolder to finalFolder and remove the tempFolder
    await fse.move(tempFolder, finalFolder, { overwrite: true });

    // Copy all contents to the final folder
    //await fse.copy(tempFolder, finalFolder);
    // Remove the temporary folder
    // await fse.remove(tempFolder);
  } catch (error) {
    if (error instanceof Error) {
      if ((error as NodeJS.ErrnoException).code === "EPERM") {
        console.error("Permission error moving folder:", error);
      } else if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        console.error("Folder not found:", error);
      } else {
        console.error("Error moving folder:", error);
      }
      console.error("Error stack:", error.stack);
    } else {
      console.error("Unknown error:", error);
    }
    throw new Error("Error moving folder");
  }
};

async function parseDataPesertaDariExcel(pesertaXlsx: Buffer) {
  try {
    const dataPesertaDariExcel = await parseExcelOnServer(pesertaXlsx, {
      extractFromColumns: extractFromColumns,
    });

    // seharusnya g pernah sampe sini jika pengecekan di client sudah benar dan tidak di bypass
    // check it there is any empty column that is not allowed
    const splitEmptyValuesResult = splitEmptyValues(
      dataPesertaDariExcel.emptyValues,
      emptyAllowed
    );

    const { allowEmpty, shouldNotEmpty } = splitEmptyValuesResult;
    console.log("allowEmpty", allowEmpty);
    console.log("shouldNotEmpty", shouldNotEmpty);

    if (Object.keys(shouldNotEmpty).length > 0) {
      let error = "";
      // iterate over the rows with empty columns that are not allowed
      for (const [rowIndex, columns] of Object.entries(shouldNotEmpty)) {
        const rowNum = Number(rowIndex);
        console.log("Row", rowNum, "has empty columns:", columns);
        error += `Baris ${rowNum} memiliki kolom kosong: ${columns.join(
          ", "
        )}\n`;
      }
      throw new Error(error);
    }
    return dataPesertaDariExcel;
  } catch (error) {
    console.error("Error parsing xlsx file:", error);
    throw new Error("Error parsing xlsx file");
  }
}

async function createKegiatan(
  prisma: Prisma.TransactionClient,
  dataparsed: ZKegiatan,
  satkerId: string,
  unitKerjaId: string,
  penggunaId: string
) {
  return prisma.kegiatan.create({
    data: {
      id: dataparsed.cuid,
      status: "setup-kegiatan",
      nama: dataparsed.nama,
      tanggalMulai: dataparsed.tanggalMulai,
      tanggalSelesai: dataparsed.tanggalSelesai,
      lokasi: dataparsed.lokasi,
      dokumenNodinMemoSk: dataparsed.dokumenNodinMemoSkCuid,
      dokumenJadwal: dataparsed.dokumenJadwalCuid,
      satkerId: satkerId,
      unitKerjaId: unitKerjaId,
      createdBy: penggunaId,
      provinsiId: dataparsed.provinsi,
    },
  });
}

async function insertPesertaDariExcel(
  prisma: Prisma.TransactionClient,
  kegiatanBaruId: string,
  pesertaKegiatan: Record<string, any>[],
  penggunaId: string
) {
  const pesertaBaru = await Promise.all(
    pesertaKegiatan.map(async (peserta) => {
      // checks againts zod schema harusnya dilakukan disisi client saja
      // anggap saja ini adalah data yang valid

      const pesertaBaru = await prisma.pesertaKegiatan.create({
        data: {
          nama: peserta["Nama"],
          NIP: peserta["NIP"].toString(),
          NIK: peserta["NIK"].toString().trim(),
          NPWP: peserta["NPWP"].toString().trim(),
          pangkatGolonganId: peserta["Golongan/Ruang"]
            .toString()
            .trim()
            .toUpperCase(),
          eselon: peserta["Eselon"],
          jabatan: peserta["Jabatan"],
          kegiatanId: kegiatanBaruId,
          bank: peserta["Bank"],
          nomorRekening: peserta["Nomor Rekening"],
          namaRekening: peserta["Nama Rekening"],
          createdBy: penggunaId,
          jumlahHari: 0, // Default to 0 HARDCODED
        },
      });
      return pesertaBaru;
    })
  );
}

async function insertDokumenSuratTugas(
  prisma: Prisma.TransactionClient,
  kegiatanBaruId: string,
  dataparsed: ZKegiatan,
  penggunaId: string
) {
  console.log(
    "dataparsed.dokumenSuratTugasCuid",
    dataparsed.dokumenSuratTugasCuid
  );
  if (dataparsed.dokumenSuratTugasCuid) {
    if (typeof dataparsed.dokumenSuratTugasCuid === "string") {
      try {
        dataparsed.dokumenSuratTugasCuid = JSON.parse(
          dataparsed.dokumenSuratTugasCuid
        );
      } catch (error) {
        console.error("Failed to parse dokumenSuratTugasCuid as JSON:", error);
      }
    }

    if (Array.isArray(dataparsed.dokumenSuratTugasCuid)) {
      console.log("dataparsed.dokumenSuratTugasCuid is an array");
      await Promise.all(
        dataparsed.dokumenSuratTugasCuid.map((dokumen) => {
          if (dokumen) {
            return prisma.dokumenSuratTugas.create({
              data: {
                nama: dokumen,
                dokumen: dokumen,
                kegiatanId: kegiatanBaruId,
                createdBy: penggunaId,
              },
            });
          } else {
            // Handle the case where dokumen.name is undefined
            return Promise.resolve();
          }
        })
      );
    } else {
      console.log("dataparsed.dokumenSuratTugasCuid is not an array");
      if (dataparsed.dokumenSuratTugasCuid) {
        await prisma.dokumenSuratTugas.create({
          data: {
            nama: dataparsed.dokumenSuratTugasCuid,
            dokumen: dataparsed.dokumenSuratTugasCuid,
            kegiatanId: kegiatanBaruId,
            createdBy: penggunaId,
          },
        });
      } else {
        // Handle the case where dokumenSuratTugas.name is undefined
        console.error(
          "[SHOULD NEVER BE HERE] dokumenSuratTugas.name is undefined"
        );
      }
    }
  }
}

async function insertDokumenKegiatan(
  prisma: Prisma.TransactionClient,
  kegiatanBaruId: string,
  dataparsed: ZKegiatan,
  penggunaId: string
) {
  console.log(
    "dataparsed.dokumenSuratTugasCuid",
    dataparsed.dokumenSuratTugasCuid
  );

  interface DokumenKegiatan {
    nama: string;
    dokumen: string;
    jenisDokumenId: string;
    kegiatanId: string;
    createdBy: string;
  }

  let dokumenKegiatan: DokumenKegiatan[] = [];

  try {
    if (dataparsed.dokumenSuratTugasCuid) {
      if (typeof dataparsed.dokumenSuratTugasCuid === "string") {
        try {
          dataparsed.dokumenSuratTugasCuid = JSON.parse(
            dataparsed.dokumenSuratTugasCuid
          );
        } catch (error) {
          console.error(
            "Failed to parse dokumenSuratTugasCuid as JSON:",
            error
          );
        }
      }

      if (Array.isArray(dataparsed.dokumenSuratTugasCuid)) {
        console.log("dataparsed.dokumenSuratTugasCuid is an array");
        const daftarDokumenSuratTugas = dataparsed.dokumenSuratTugasCuid.map(
          (dokumen) => {
            return {
              nama: dokumen,
              dokumen: dokumen,
              jenisDokumenId: "surat-tugas",
              kegiatanId: kegiatanBaruId,
              createdBy: penggunaId,
            };
          }
        );
        await prisma.dokumenKegiatan.createMany({
          data: daftarDokumenSuratTugas,
        });
        dokumenKegiatan = [...dokumenKegiatan, ...daftarDokumenSuratTugas];
      } else {
        console.log("dataparsed.dokumenSuratTugasCuid is not an array");
        if (dataparsed.dokumenSuratTugasCuid) {
          await prisma.dokumenKegiatan.create({
            data: {
              nama: dataparsed.dokumenSuratTugasCuid,
              dokumen: dataparsed.dokumenSuratTugasCuid,
              kegiatanId: kegiatanBaruId,
              createdBy: penggunaId,
            },
          });
        } else {
          // Handle the case where dokumenSuratTugas.name is undefined
          console.error(
            "[SHOULD NEVER BE HERE] dokumenSuratTugas.name is undefined"
          );
        }
      }
    }

    if (dataparsed.dokumenJadwalCuid) {
      const newDok = {
        nama: "Jadwal Kegiatan",
        dokumen: dataparsed.dokumenJadwalCuid,
        jenisDokumenId: "jadwal-kegiatan",
        kegiatanId: kegiatanBaruId,
        createdBy: penggunaId,
      };
      const dok = await prisma.dokumenKegiatan.create({
        data: newDok,
      });
      dokumenKegiatan.push(newDok);
    }

    if (dataparsed.dokumenNodinMemoSkCuid) {
      const newDok = {
        nama: "Nodin/Memo/Surat Keputusan",
        dokumen: dataparsed.dokumenNodinMemoSkCuid,
        jenisDokumenId: "nodin-memo-sk",
        kegiatanId: kegiatanBaruId,
        createdBy: penggunaId,
      };
      await prisma.dokumenKegiatan.create({
        data: newDok,
      });
      dokumenKegiatan.push(newDok);
    }

    if (
      dataparsed.lokasi === "LUAR_NEGERI" &&
      dataparsed.dokumenSuratSetnegSptjmCuid
    ) {
      const newDok = {
        nama: "Surat Setneg/SPTJM",
        dokumen: dataparsed.dokumenSuratSetnegSptjmCuid,
        jenisDokumenId: "surat-setneg-sptjm",
        kegiatanId: kegiatanBaruId,
        createdBy: penggunaId,
      };
      await prisma.dokumenKegiatan.create({
        data: newDok,
      });
      dokumenKegiatan.push(newDok);
    }

    return {
      success: true,
      data: dokumenKegiatan,
    };
  } catch (error) {
    // return getPrismaErrorResponse(error as Error);
    console.error("Error saving dokumen kegiatan", error);
    throw error;
  }
}

const insertItinerary = async (
  prisma: Prisma.TransactionClient,
  itinerary: ZItinerary[],
  kegiatanBaruId: string,
  penggunaId: string
) => {
  // iterate over the itinerary and modify the data to conform to the database schema
  const itineraryBaru = itinerary.map((itinerary) => {
    delete itinerary.dariLokasi;
    delete itinerary.keLokasi;
    return {
      ...itinerary,
      kegiatanId: kegiatanBaruId,
      createdBy: penggunaId,
    };
  });

  const insertedItinerary = await prisma.itinerary.createMany({
    data: itineraryBaru,
  });
  return insertedItinerary;
};

export default setupKegiatan;
