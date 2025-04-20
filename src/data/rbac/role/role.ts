import { dbHonorarium } from "@/lib/db-honorarium";
import { Prisma } from "@prisma-honorarium/client";

export type Resource = {
  resource: string;
};

export const getListOfResource = async () => {
  const rawQuery = Prisma.sql`
    SELECT distinct(resource) as resource from permissions p 
    ORDER BY resource asc
  `;
  const narasumber = await dbHonorarium.$queryRaw<Resource[]>(rawQuery);

  return narasumber;
};

export const getRole = async (id: string) => {
  const role = await dbHonorarium.role.findUnique({
    where: {
      id,
    },
  });
  return role;
};
