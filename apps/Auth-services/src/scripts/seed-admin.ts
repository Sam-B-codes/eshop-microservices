import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import prisma from "@org/prisma";

// Load variables from the root .env file.
dotenv.config();

const SALT_ROUNDS = 12;

async function seedAdmin() {
  const name =
    process.env.ADMIN_NAME?.trim();

  const email =
    process.env.ADMIN_EMAIL
      ?.trim()
      .toLowerCase();

  const password =
    process.env.ADMIN_PASSWORD;

  if (!name) {
    throw new Error(
      "ADMIN_NAME is not configured"
    );
  }

  if (!email) {
    throw new Error(
      "ADMIN_EMAIL is not configured"
    );
  }

  if (!password) {
    throw new Error(
      "ADMIN_PASSWORD is not configured"
    );
  }

  if (password.length < 8) {
    throw new Error(
      "ADMIN_PASSWORD must contain at least 8 characters"
    );
  }

  const hashedPassword =
    await bcrypt.hash(
      password,
      SALT_ROUNDS
    );

  const admin =
    await prisma.admins.upsert({
      where: {
        email,
      },

      create: {
        name,
        email,
        password:
          hashedPassword,
        role:
          "SUPER_ADMIN",
        status:
          "ACTIVE",
      },

      update: {
        name,
        password:
          hashedPassword,
        role:
          "SUPER_ADMIN",
        status:
          "ACTIVE",
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

  console.log(
    "Admin account created successfully:"
  );

  console.table([
    {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      status: admin.status,
    },
  ]);
}

seedAdmin()
  .catch((error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error";

    console.error(
      "Failed to create Admin account:",
      message
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });