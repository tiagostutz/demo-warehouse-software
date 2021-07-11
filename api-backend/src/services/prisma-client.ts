const globalAny: any = global;
import { PrismaClient } from "@prisma/client";

let prismaInstance: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prismaInstance = new PrismaClient();
} else {
  // To prevent connection leaking in desenv/test environment, put the connection pool in a global var
  if (!globalAny.prisma) {
    globalAny.prisma = new PrismaClient();
  }

  prismaInstance = globalAny.prisma;
}

export const prisma = prismaInstance;
