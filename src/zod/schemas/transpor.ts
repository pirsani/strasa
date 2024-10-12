import { z } from "zod";

export const sbmTransporDalamKotaPulangPergiSchema = z.object({
  id: z.string().optional(),
  besaran: z.coerce.number().transform((val) => (isNaN(val) ? 0 : val)), // Transform NaN to 0
  tahun: z.coerce.number().int().min(2024).max(2034),
});

export const sbmTransporJakartaKeKotaKabSekitarSchema = z.object({
  id: z.string().optional(),
  kotaId: z.string(),
  besaran: z.coerce.number().transform((val) => (isNaN(val) ? 0 : val)), // Transform NaN to 0
  tahun: z.coerce.number().int().min(2024).max(2034),
});

export const sbmTransporIbukotaKeKotaKabSchema = z.object({
  id: z.string().optional(),
  ibukotaId: z.string(),
  kotaId: z.string(),
  besaran: z.coerce.number().transform((val) => (isNaN(val) ? 0 : val)), // Transform NaN to 0
  tahun: z.coerce.number().int().min(2024).max(2034),
});

export type SbmTransporDalamKotaPulangPergi = z.infer<
  typeof sbmTransporDalamKotaPulangPergiSchema
>;
export type SbmTransporJakartaKeKotaKabSekitar = z.infer<
  typeof sbmTransporJakartaKeKotaKabSekitarSchema
>;
export type TransporIbukotaKeKotaKab = z.infer<
  typeof sbmTransporIbukotaKeKotaKabSchema
>;
