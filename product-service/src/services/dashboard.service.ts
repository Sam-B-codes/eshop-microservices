import prisma from "@org/prisma";

export const getSellerDashboardStats = async (
  sellerId: string
) => {
  const products = await prisma.product.findMany({
    where: {
      sellerId,
    },
    select: {
      id: true,
      status: true,
      stock: true,
    },
  });

  const totalProducts = products.length;

  const publishedProducts = products.filter(
    (product) => product.status === "PUBLISHED"
  ).length;

  const draftProducts = products.filter(
    (product) => product.status === "DRAFT"
  ).length;

  const outOfStockProducts = products.filter(
    (product) =>
      product.stock === 0 ||
      product.status === "OUT_OF_STOCK"
  ).length;

  const lowStockProducts = products.filter(
    (product) =>
      product.stock > 0 &&
      product.stock <= 10
  ).length;

  return {
    totalProducts,
    publishedProducts,
    draftProducts,
    outOfStockProducts,
    lowStockProducts,
  };
};