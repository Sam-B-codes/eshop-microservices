import prisma from "@org/prisma";

const normalizeDiscountPrice = (
  price: number,
  discountPrice?: number | null,
): number | null => {
  if (
    discountPrice !== null &&
    discountPrice !== undefined &&
    Number.isFinite(discountPrice) &&
    discountPrice >= 0 &&
    discountPrice < price
  ) {
    return discountPrice;
  }

  return null;
};

const calculateSalePrice = (price: number, discountPrice?: number | null) => {
  return normalizeDiscountPrice(price, discountPrice) ?? price;
};

const moneyIsEqual = (first: number, second: number) => {
  return Math.abs(first - second) < 0.001;
};

async function backfillSalePrice() {
  console.log("Starting effective-price backfill...");

  const products = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      price: true,
      discountPrice: true,
      salePrice: true,
    },
  });

  let updatedCount = 0;
  let skippedCount = 0;

  for (const product of products) {
    const normalizedDiscountPrice = normalizeDiscountPrice(
      product.price,
      product.discountPrice,
    );

    const salePrice = calculateSalePrice(
      product.price,
      normalizedDiscountPrice,
    );

    const discountIsEqual = product.discountPrice === normalizedDiscountPrice;

    const salePriceIsEqual = moneyIsEqual(product.salePrice, salePrice);

    if (discountIsEqual && salePriceIsEqual) {
      skippedCount += 1;

      continue;
    }

    await prisma.product.update({
      where: {
        id: product.id,
      },

      data: {
        discountPrice: normalizedDiscountPrice,

        salePrice,
      },
    });

    console.log(
      `UPDATED: ${product.title} | price=${product.price} | discount=${normalizedDiscountPrice ?? "none"} | salePrice=${salePrice}`,
    );

    updatedCount += 1;
  }

  console.log("=========================================");

  console.log("EFFECTIVE PRICE BACKFILL COMPLETE");

  console.log("=========================================");

  console.log(`Total products : ${products.length}`);

  console.log(`Updated        : ${updatedCount}`);

  console.log(`Skipped        : ${skippedCount}`);
}

backfillSalePrice()
  .catch((error: unknown) => {
    console.error("Effective-price backfill failed:", error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
