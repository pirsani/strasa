import { Prisma, PrismaClient } from "@prisma-honorarium/client";

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var prismaDbHonorarium: PrismaClient | undefined;
}

export const dbHonorarium = global.prismaDbHonorarium || new PrismaClient();

if (process.env.NODE_ENV !== "production")
  global.prismaDbHonorarium = dbHonorarium;

export { Prisma };
