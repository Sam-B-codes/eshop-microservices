import prisma from "./src/lib/prisma";

const oldProductIds = [
  "6a7cbc61db985e3f557664ab",
  "6a85ab3184c9e0ccb3a66615",
  "6a85ad5084c9e0ccb3a66617",
  "6a8b10803440ff56436d5a5e",
  "6a8b19c63440ff56436d5a61",
  "6a8b1a2e3440ff56436d5a62",
  "6a8b1a983440ff56436d5a63",
  "6a8b1b8a3440ff56436d5a66",
  "6a8b1cec3440ff56436d5a68",
];

async function main() {
  console.log("\n🧹 Removing old development products...\n");

  const result = await prisma.product.deleteMany({
    where: {
      id: {
        in: oldProductIds,
      },
    },
  });

  console.log(`✅ Deleted ${result.count} old products.`);

  // Verify final database state
  const published = await prisma.product.count({
    where: {
      status: "PUBLISHED",
    },
  });

  const drafts = await prisma.product.count({
    where: {
      status: "DRAFT",
    },
  });

  const demoPublished = await prisma.product.count({
    where: {
      status: "PUBLISHED",
      sku: {
        startsWith: "DEMO-",
      },
    },
  });

  console.log("\n================================");
  console.log("       DATABASE CLEANUP");
  console.log("================================");
  console.log(`Published products : ${published}`);
  console.log(`Demo published     : ${demoPublished}`);
  console.log(`Draft products     : ${drafts}`);
  console.log("================================");

  if (
    result.count === 9 &&
    published === 40 &&
    demoPublished === 40 &&
    drafts === 1
  ) {
    console.log("\n✅ Storefront database is clean.");
    console.log("✅ 40 published products ready.");
    console.log("✅ 1 draft test product preserved.");
    console.log("✅ Old development products removed.");
  } else {
    console.log(
      "\n⚠️ Counts differ from expected values. Check before making further deletions."
    );
  }
}

main()
  .catch((error) => {
    console.error("\n❌ Cleanup failed:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });