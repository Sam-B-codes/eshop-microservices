import dotenv from "dotenv";

import prisma from "@org/prisma";

dotenv.config({
  quiet: true,
});

async function backfillUserStatus() {
  const result =
    await prisma.$runCommandRaw({
      update: "users",

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

  const totalUsers =
    await prisma.users.count();

  const activeUsers =
    await prisma.users.count({
      where: {
        status: "ACTIVE",
      },
    });

  const suspendedUsers =
    await prisma.users.count({
      where: {
        status:
          "SUSPENDED",
      },
    });

  console.table([
    {
      totalUsers,
      activeUsers,
      suspendedUsers,
    },
  ]);

  if (
    totalUsers !==
    activeUsers +
      suspendedUsers
  ) {
    throw new Error(
      "Some users still do not have a valid account status"
    );
  }

  console.log(
    "User status backfill completed successfully."
  );
}

backfillUserStatus()
  .catch((error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error";

    console.error(
      "User status backfill failed:",
      message
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });