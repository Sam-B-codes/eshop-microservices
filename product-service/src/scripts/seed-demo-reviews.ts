import prisma from "@org/prisma";

// ======================================================
// DEMO REVIEW CONTENT
// ======================================================

const demoReviews = [
  {
    rating: 5,
    title: "Excellent purchase",
    comment:
      "The product quality was excellent, matched the description and arrived in perfect condition.",
  },
  {
    rating: 4,
    title: "Very satisfied",
    comment:
      "A very good product overall. The quality and packaging were impressive and delivery was smooth.",
  },
  {
    rating: 5,
    title: "Worth the price",
    comment:
      "I am very happy with this purchase. The product feels premium and works exactly as expected.",
  },
  {
    rating: 4,
    title: "Good quality",
    comment:
      "The product is well made and looks exactly like the pictures. I would recommend it.",
  },
  {
    rating: 5,
    title: "Loved it",
    comment:
      "Great shopping experience and excellent product quality. I would happily order again.",
  },
  {
    rating: 3,
    title: "Good overall",
    comment:
      "The product is good and performs as described, though the packaging could have been better.",
  },
];

const demoReplies = [
  "Thank you for your feedback. We are glad you enjoyed your purchase.",
  "Thank you for choosing our store. We appreciate your support.",
  "We are happy to hear that the product met your expectations.",
];

// ======================================================
// SEED REVIEWS
// ======================================================

async function seedDemoReviews() {
  if (
    process.env.NODE_ENV ===
      "production" &&
    process.env
      .ALLOW_DEMO_SEED !==
      "true"
  ) {
    throw new Error(
      "Demo review seeding is disabled in production."
    );
  }

  console.log(
    "Searching for paid and delivered purchases..."
  );

  const orders =
    await prisma.order.findMany({
      where: {
        paymentStatus:
          "PAID",

        sellerOrders: {
          some: {
            status:
              "DELIVERED",
          },
        },
      },

      include: {
        items: true,

        sellerOrders: {
          select: {
            sellerId: true,
            status: true,
          },
        },
      },

      orderBy: {
        createdAt:
          "desc",
      },

      take: 50,
    });

  if (
    orders.length === 0
  ) {
    console.log(
      "No paid and delivered orders were found."
    );

    console.log(
      "Complete one test order and mark its seller fulfilment as DELIVERED, then run this script again."
    );

    return;
  }

  let createdCount = 0;
  let skippedCount = 0;
  let candidateIndex = 0;

  const processedPurchases =
    new Set<string>();

  for (
    const order of orders
  ) {
    const deliveredSellerIds =
      new Set(
        order.sellerOrders
          .filter(
            (sellerOrder) =>
              sellerOrder.status ===
              "DELIVERED"
          )
          .map(
            (sellerOrder) =>
              sellerOrder.sellerId
          )
      );

    for (
      const item of
      order.items
    ) {
      if (
        !deliveredSellerIds.has(
          item.sellerId
        )
      ) {
        continue;
      }

      const purchaseKey =
        `${order.userId}:${item.productId}`;

      if (
        processedPurchases.has(
          purchaseKey
        )
      ) {
        continue;
      }

      processedPurchases.add(
        purchaseKey
      );

      const existingReview =
        await prisma.review.findUnique({
          where: {
            userId_productId: {
              userId:
                order.userId,

              productId:
                item.productId,
            },
          },

          select: {
            id: true,
          },
        });

      if (existingReview) {
        skippedCount += 1;
        continue;
      }

      const demo =
        demoReviews[
          candidateIndex %
            demoReviews.length
        ];

      const shouldReply =
        candidateIndex %
          3 !==
        1;

      await prisma.review.create({
        data: {
          userId:
            order.userId,

          productId:
            item.productId,

          sellerId:
            item.sellerId,

          orderId:
            order.id,

          rating:
            demo.rating,

          title:
            demo.title,

          comment:
            demo.comment,

          sellerReply:
            shouldReply
              ? demoReplies[
                  candidateIndex %
                    demoReplies.length
                ]
              : null,

          sellerRepliedAt:
            shouldReply
              ? new Date()
              : null,

          status:
            "PUBLISHED",
        },
      });

      createdCount += 1;
      candidateIndex += 1;

      console.log(
        `Created review for: ${item.productTitle}`
      );
    }
  }

  console.log(
    "======================================"
  );

  console.log(
    "Demo review seed completed"
  );

  console.log(
    `Created : ${createdCount}`
  );

  console.log(
    `Skipped : ${skippedCount}`
  );

  if (
    createdCount === 0
  ) {
    console.log(
      "All eligible products already have reviews."
    );
  }
}

// ======================================================
// RUN
// ======================================================

seedDemoReviews()
  .catch((error) => {
    console.error(
      "Demo review seed failed:"
    );

    console.error(error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });