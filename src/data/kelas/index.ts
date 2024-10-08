import { dbHonorarium } from "@/lib/db-honorarium";

const getKelas = async () => {
  const kelas = await dbHonorarium.kelas.findMany({});
  return kelas;
};
