import { Prisma, UserStatus } from "@prisma/client";

import prisma from "@org/prisma";

import { BadRequestError, NotFoundError } from "@org/error-handler";

import {
  AdminUserListParams,
  AdminUserListResponse,
} from "../types/admin-user.types";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export const getAdminUsers = async (
  params: AdminUserListParams,
): Promise<AdminUserListResponse> => {
  const page = Math.max(Math.trunc(params.page ?? 1), 1);

  const limit = Math.min(
    Math.max(Math.trunc(params.limit ?? DEFAULT_LIMIT), 1),
    MAX_LIMIT,
  );

  const search = params.search?.trim();

  const where: Prisma.usersWhereInput = {
    ...(params.status
      ? {
          status: params.status,
        }
      : {}),

    ...(search
      ? {
          OR: [
            {
              name: {
                contains: search,

                mode: "insensitive",
              },
            },
            {
              email: {
                contains: search,

                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };

  const [totalUsers, users] = await Promise.all([
    prisma.users.count({
      where,
    }),

    prisma.users.findMany({
      where,

      skip: (page - 1) * limit,

      take: limit,

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true,

        _count: {
          select: {
            orders: true,
          },
        },
      },
    }),
  ]);

  const totalPages = totalUsers === 0 ? 0 : Math.ceil(totalUsers / limit);

  return {
    success: true,

    message: "Users fetched successfully",

    users: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      orderCount: user._count.orders,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    })),

    pagination: {
      page,
      limit,
      totalUsers,
      totalPages,

      hasPreviousPage: page > 1,

      hasNextPage: page < totalPages,
    },
  };
};

export const updateAdminUserStatus = async (
  userId: string,
  status: UserStatus,
) => {
  const normalizedUserId = userId.trim();

  if (!normalizedUserId) {
    throw new BadRequestError("User ID is required");
  }

  if (status !== "ACTIVE" && status !== "SUSPENDED") {
    throw new BadRequestError("Invalid user status");
  }

  const existingUser = await prisma.users.findUnique({
    where: {
      id: normalizedUserId,
    },

    select: {
      id: true,
    },
  });

  if (!existingUser) {
    throw new NotFoundError("User not found");
  }

  const user = await prisma.users.update({
    where: {
      id: normalizedUserId,
    },

    data: {
      status,
    },

    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      createdAt: true,
      updatedAt: true,

      _count: {
        select: {
          orders: true,
        },
      },
    },
  });

  return {
    success: true,

    message:
      status === "SUSPENDED"
        ? "User suspended successfully"
        : "User reactivated successfully",

    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      orderCount: user._count.orders,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
  };
};
