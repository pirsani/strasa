import { PrismaClient } from "@prisma-honorarium/client";

declare global {
  var prismaDbHonorarium: PrismaClient | undefined;
}

export const dbHonorarium = global.prismaDbHonorarium || new PrismaClient();

if (process.env.NODE_ENV !== "production")
  global.prismaDbHonorarium = dbHonorarium;

export { Prisma } from "@prisma-honorarium/client";
