import dotenv from "dotenv";

import prisma from "@org/prisma";

dotenv.config({
  quiet: true,
});

async function backfillSellerStatus() {
  const result =
    await prisma.$runCommandRaw({
      update: "sellers",

      updates: [
        {
          q: {
            status: {
              $exists: false,
            },
          },

          u: {
            $set: {
              status: "ACTIVE",
            },
          },

          multi: true,
        },
      ],
    });

  console.log(
    "MongoDB backfill result:"
  );

  console.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

  const totalSellers =
    await prisma.sellers.count();

  const activeSellers =
    await prisma.sellers.count({
      where: {
        status: "ACTIVE",
      },
    });

  const suspendedSellers =
    await prisma.sellers.count({
      where: {
        status:
          "SUSPENDED",
      },
    });

  console.table([
    {
      totalSellers,
      activeSellers,
      suspendedSellers,
    },
  ]);

  if (
    totalSellers !==
    activeSellers +
      suspendedSellers
  ) {
    throw new Error(
      "Some sellers still do not have a valid account status"
    );
  }

  console.log(
    "Seller status backfill completed successfully."
  );
}

backfillSellerStatus()
  .catch((error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error";

    console.error(
      "Seller status backfill failed:",
      message
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });