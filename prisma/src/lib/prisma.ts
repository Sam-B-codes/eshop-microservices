import { PrismaClient } from "@prisma/client";

declare global {
   
  var prismadb: PrismaClient | undefined;
}

const prisma =
  global.prismadb ??
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prismadb = prisma;
}

export default prisma;