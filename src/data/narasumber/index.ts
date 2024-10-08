import { dbHonorarium } from "@/lib/db-honorarium";
import { Narasumber, Prisma } from "@prisma-honorarium/client";

export type NarasumberWithStringDate = Omit<
  Narasumber,
  "createdAt" | "updatedAt"
> & {
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
};

const getNarasumber = async () => {
  const rawQuery = Prisma.sql`
    SELECT 
      id,
      nama,
      NIP as "NIP",
      NPWP as "NPWP",
      jabatan,
      eselon,
      pangkat_golongan_id AS "pangkatGolonganId",
      jenis_honorarium_id AS "jenisHonorariumId",
      email,
      bank, 
      nama_rekening AS "namaRekening",
      nomor_rekening AS "nomorRekening",
      created_by AS "createdBy",
      created_at AS "createdAt",
      TO_CHAR(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "createdAt",
      TO_CHAR(updated_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "updatedAt"
    FROM 
      narasumber order by nama;
  `;
  const narasumber = await dbHonorarium.$queryRaw<NarasumberWithStringDate[]>(
    rawQuery
  );

  return narasumber;
};

export default getNarasumber;
