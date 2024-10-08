"use server";
import { ActionResponse } from "@/actions/response";
import { dbHonorarium } from "@/lib/db-honorarium";
import { Organisasi } from "@prisma-honorarium/client";

export const deleteDataOrganisasi = async (
  id: string
): Promise<ActionResponse<Organisasi>> => {
  return {
    success: false,
    message: "Not implemented yet",
    error: "Not implemented yet",
  };
};

export const getOptionsOrganisasi = async () => {
  const dataOrganisasi = await dbHonorarium.organisasi.findMany({});
  // map dataOrganisasi to options
  const optionsOrganisasi = dataOrganisasi.map((unit) => ({
    value: unit.id,
    label: unit.nama,
  }));

  return optionsOrganisasi;
};

export const getOptionsSatkerAnggaran = async () => {
  const dataOrganisasi = await dbHonorarium.organisasi.findMany({
    where: {
      isSatkerAnggaran: true,
    },
  });
  // map dataOrganisasi to options
  const optionsOrganisasi = dataOrganisasi.map((unit) => ({
    value: unit.id,
    label: unit.nama,
  }));

  return optionsOrganisasi;
};
