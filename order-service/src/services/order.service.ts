import prisma from "@org/prisma";

import {
  BadRequestError,
  NotFoundError,
} from "@org/error-handler";

import {
  CreateOrderInput,
  SellerOrderListQuery,
  SellerOrderListResult,
} from "../types/order.types";

import {
  sendOrderCreatedEvent,
} from "./order-event.service";
// ======================================================
// ROUND MONEY
// ======================================================

const roundMoney = (
  value: number
) => {
  return (
    Math.round(
      (value + Number.EPSILON) * 100
    ) / 100
  );
};

// ======================================================
// NORMALIZE STRING
// ======================================================

const normalizeString = (
  value: unknown
) => {
  return typeof value === "string"
    ? value.trim()
    : "";
};

// ======================================================
// GET FIRST PRODUCT IMAGE
// ======================================================

const getFirstProductImage = (
  images: unknown
): string | null => {
  if (!Array.isArray(images)) {
    return null;
  }

  const firstImage =
    images[0];

  if (!firstImage) {
    return null;
  }

  if (
    typeof firstImage ===
    "string"
  ) {
    return firstImage;
  }

  if (
    typeof firstImage ===
      "object" &&
    firstImage !== null &&
    "url" in firstImage
  ) {
    const url = (
      firstImage as {
        url?: unknown;
      }
    ).url;

    return typeof url ===
      "string"
      ? url
      : null;
  }

  return null;
};

// ======================================================
// VALIDATE CHECKOUT DETAILS
// ======================================================

const validateCheckoutDetails = (
  input: CreateOrderInput
) => {
  const email =
    normalizeString(
      input.email
    );

  const phone =
    normalizeString(
      input.phone
    );

  const shipping =
    input.shippingAddress;

  if (!email) {
    throw new BadRequestError(
      "Email is required"
    );
  }

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    !emailPattern.test(email)
  ) {
    throw new BadRequestError(
      "Please enter a valid email address"
    );
  }

  if (!phone) {
    throw new BadRequestError(
      "Phone number is required"
    );
  }

  if (!shipping) {
    throw new BadRequestError(
      "Shipping address is required"
    );
  }

  if (
    !normalizeString(
      shipping.fullName
    )
  ) {
    throw new BadRequestError(
      "Full name is required"
    );
  }

  if (
    !normalizeString(
      shipping.addressLine1
    )
  ) {
    throw new BadRequestError(
      "Address is required"
    );
  }

  if (
    !normalizeString(
      shipping.city
    )
  ) {
    throw new BadRequestError(
      "City is required"
    );
  }

  if (
    !normalizeString(
      shipping.state
    )
  ) {
    throw new BadRequestError(
      "State is required"
    );
  }

  const postalCode =
    normalizeString(
      shipping.postalCode
    );

  if (!postalCode) {
    throw new BadRequestError(
      "Postal code is required"
    );
  }

  if (
    !/^\d{6}$/.test(
      postalCode
    )
  ) {
    throw new BadRequestError(
      "Postal code must be 6 digits"
    );
  }

  if (
    !normalizeString(
      shipping.country
    )
  ) {
    throw new BadRequestError(
      "Country is required"
    );
  }
};

// ======================================================
// CALCULATE COUPON DISCOUNT
// ======================================================

const calculateCouponDiscount = (
  discountType:
    | "PERCENTAGE"
    | "FIXED",
  discountValue: number,
  sellerSubtotal: number,
  maximumDiscount:
    number | null
) => {
  let discount = 0;

  if (
    discountType ===
    "PERCENTAGE"
  ) {
    discount =
      sellerSubtotal *
      (discountValue /
        100);

    if (
      maximumDiscount !==
      null
    ) {
      discount =
        Math.min(
          discount,
          maximumDiscount
        );
    }
  } else {
    discount =
      discountValue;
  }

  discount =
    Math.min(
      discount,
      sellerSubtotal
    );

  return roundMoney(
    Math.max(
      discount,
      0
    )
  );
};

// ======================================================
// COMPARE MONEY
// ======================================================

const sameMoney = (
  first: number,
  second: number
) => {
  return (
    roundMoney(first) ===
    roundMoney(second)
  );
};

// ======================================================
// CREATE ORDER
// ======================================================

export const createOrder =
  async (
    userId: string,
    input: CreateOrderInput
  ) => {
    // ==================================================
    // VALIDATE CUSTOMER INPUT
    // ==================================================

    validateCheckoutDetails(
      input
    );

    // ==================================================
    // VERIFY CUSTOMER
    // ==================================================

    const user =
      await prisma.users.findUnique({
        where: {
          id: userId,
        },

        select: {
          id: true,
        },
      });

    if (!user) {
      throw new NotFoundError(
        "User not found"
      );
    }

    // ==================================================
    // LOAD CURRENT CART
    // ==================================================

    const cart =
      await prisma.cart.findUnique({
        where: {
          userId,
        },

        include: {
          items: {
            orderBy: {
              createdAt:
                "asc",
            },

            include: {
              product: {
                select: {
                  id: true,

                  sellerId:
                    true,

                  title:
                    true,

                  slug:
                    true,

                  sku:
                    true,

                  salePrice:
                    true,

                  stock:
                    true,

                  status:
                    true,

                  images:
                    true,
                },
              },
            },
          },
        },
      });

    if (
      !cart ||
      cart.items.length ===
        0
    ) {
      throw new BadRequestError(
        "Your cart is empty"
      );
    }

    // ==================================================
    // VALIDATE CART ITEMS
    // ==================================================

    for (
      const item of
      cart.items
    ) {
      const product =
        item.product;

      if (
        product.status !==
        "PUBLISHED"
      ) {
        throw new BadRequestError(
          `${product.title} is no longer available`
        );
      }

      if (
        product.stock <=
        0
      ) {
        throw new BadRequestError(
          `${product.title} is out of stock`
        );
      }

      if (
        item.quantity >
        product.stock
      ) {
        throw new BadRequestError(
          `Only ${product.stock} item(s) of ${product.title} are available`
        );
      }

      if (
        item.quantity <
        1
      ) {
        throw new BadRequestError(
          `Invalid quantity for ${product.title}`
        );
      }

      if (
        !Number.isFinite(
          product.salePrice
        ) ||
        product.salePrice <
          0
      ) {
        throw new BadRequestError(
          `Invalid price for ${product.title}`
        );
      }
    }

    // ==================================================
    // AUTHORITATIVE SUBTOTAL
    // ==================================================

    const subtotal =
      roundMoney(
        cart.items.reduce(
          (
            total,
            item
          ) => {
            return (
              total +
              item.product
                .salePrice *
                item.quantity
            );
          },
          0
        )
      );

    if (
      subtotal <= 0
    ) {
      throw new BadRequestError(
        "Order total must be greater than zero"
      );
    }

    // ==================================================
    // SELLER SUBTOTALS
    // ==================================================

    const sellerSubtotals =
      new Map<
        string,
        number
      >();

    for (
      const item of
      cart.items
    ) {
      const sellerId =
        item.product
          .sellerId;

      const currentSubtotal =
        sellerSubtotals.get(
          sellerId
        ) ?? 0;

      sellerSubtotals.set(
        sellerId,
        roundMoney(
          currentSubtotal +
            item.product
              .salePrice *
              item.quantity
        )
      );
    }

    // ==================================================
    // COUPON
    // ==================================================

    let couponId:
      string | null =
      null;

    let couponCode:
      string | null =
      null;

    let couponSellerId:
      string | null =
      null;

    let couponDiscount =
      0;

    if (input.coupon) {
      const normalizedCode =
        normalizeString(
          input.coupon.code
        ).toUpperCase();

      const sellerId =
        normalizeString(
          input.coupon
            .sellerId
        );

      if (
        !normalizedCode
      ) {
        throw new BadRequestError(
          "Coupon code is required"
        );
      }

      if (!sellerId) {
        throw new BadRequestError(
          "Coupon seller is required"
        );
      }

      const sellerSubtotal =
        sellerSubtotals.get(
          sellerId
        );

      if (
        sellerSubtotal ===
        undefined
      ) {
        throw new BadRequestError(
          "This coupon does not apply to products in your cart"
        );
      }

      const coupon =
        await prisma.coupon.findFirst({
          where: {
            code:
              normalizedCode,

            sellerId,
          },
        });

      if (!coupon) {
        throw new BadRequestError(
          "Invalid coupon code"
        );
      }

      if (
        !coupon.isActive
      ) {
        throw new BadRequestError(
          "Coupon is inactive"
        );
      }

      const now =
        new Date();

      if (
        coupon.expiryDate <=
        now
      ) {
        throw new BadRequestError(
          "Coupon has expired"
        );
      }

      if (
        coupon.usageLimit !==
          null &&
        coupon.usedCount >=
          coupon.usageLimit
      ) {
        throw new BadRequestError(
          "Coupon usage limit has been reached"
        );
      }

      if (
        coupon.minimumOrderValue !==
          null &&
        sellerSubtotal <
          coupon.minimumOrderValue
      ) {
        throw new BadRequestError(
          `Minimum order value for this coupon is ₹${coupon.minimumOrderValue}`
        );
      }

      couponDiscount =
        calculateCouponDiscount(
          coupon.discountType,
          coupon.discountValue,
          sellerSubtotal,
          coupon.maximumDiscount
        );

      couponId =
        coupon.id;

      couponCode =
        coupon.code;

      couponSellerId =
        coupon.sellerId;
    }

    // ==================================================
    // SHIPPING
    // ==================================================

    const shippingAmount =
      0;

    // ==================================================
    // FINAL AUTHORITATIVE TOTAL
    // ==================================================

    const totalAmount =
      roundMoney(
        Math.max(
          subtotal -
            couponDiscount +
            shippingAmount,
          0
        )
      );

    // ==================================================
    // NORMALIZED CHECKOUT SNAPSHOT
    // ==================================================

    const shipping =
      input.shippingAddress;

    const contactEmail =
      normalizeString(
        input.email
      ).toLowerCase();

    const contactPhone =
      normalizeString(
        input.phone
      );

    const shippingFullName =
      normalizeString(
        shipping.fullName
      );

    const shippingAddressLine1 =
      normalizeString(
        shipping.addressLine1
      );

    const shippingAddressLine2 =
      normalizeString(
        shipping.addressLine2
      ) || null;

    const shippingCity =
      normalizeString(
        shipping.city
      );

    const shippingState =
      normalizeString(
        shipping.state
      );

    const shippingPostalCode =
      normalizeString(
        shipping.postalCode
      );

    const shippingCountry =
      normalizeString(
        shipping.country
      );

    // ==================================================
    // BUILD AUTHORITATIVE ITEM SNAPSHOTS
    // ==================================================

    const orderItems =
      cart.items.map(
        (item) => {
          const unitPrice =
            roundMoney(
              item.product
                .salePrice
            );

          const lineTotal =
            roundMoney(
              unitPrice *
                item.quantity
            );

          return {
            productId:
              item.product.id,

            sellerId:
              item.product
                .sellerId,

            productTitle:
              item.product
                .title,

            productSlug:
              item.product
                .slug,

            productImage:
              getFirstProductImage(
                item.product
                  .images
              ),

            productSku:
              item.product.sku,

            unitPrice,

            quantity:
              item.quantity,

            lineTotal,
          };
        }
      );

    // ==================================================
    // DUPLICATE PENDING ORDER PROTECTION
    // ==================================================

    const pendingOrders =
      await prisma.order.findMany({
        where: {
          userId,

          status:
            "PENDING_PAYMENT",

          paymentStatus:
            "PENDING",
        },

        include: {
          items: true,
        },

        orderBy: {
          createdAt:
            "desc",
        },

        take: 10,
      });

    const reusableOrder =
      pendingOrders.find(
        (
          pendingOrder
        ) => {
          // ============================================
          // TOTALS
          // ============================================

          if (
            !sameMoney(
              pendingOrder
                .subtotal,
              subtotal
            ) ||
            !sameMoney(
              pendingOrder
                .discount,
              couponDiscount
            ) ||
            !sameMoney(
              pendingOrder
                .shippingAmount,
              shippingAmount
            ) ||
            !sameMoney(
              pendingOrder
                .totalAmount,
              totalAmount
            ) ||
            !sameMoney(
              pendingOrder
                .couponDiscount,
              couponDiscount
            )
          ) {
            return false;
          }

          // ============================================
          // COUPON
          // ============================================

          if (
            pendingOrder
              .couponId !==
              couponId ||
            pendingOrder
              .couponCode !==
              couponCode ||
            pendingOrder
              .couponSellerId !==
              couponSellerId
          ) {
            return false;
          }

          // ============================================
          // CONTACT
          // ============================================

          if (
            pendingOrder
              .contactEmail !==
              contactEmail ||
            pendingOrder
              .contactPhone !==
              contactPhone
          ) {
            return false;
          }

          // ============================================
          // SHIPPING
          // ============================================

          if (
            pendingOrder
              .shippingFullName !==
              shippingFullName ||
            pendingOrder
              .shippingAddressLine1 !==
              shippingAddressLine1 ||
            (
              pendingOrder
                .shippingAddressLine2 ??
              null
            ) !==
              shippingAddressLine2 ||
            pendingOrder
              .shippingCity !==
              shippingCity ||
            pendingOrder
              .shippingState !==
              shippingState ||
            pendingOrder
              .shippingPostalCode !==
              shippingPostalCode ||
            pendingOrder
              .shippingCountry !==
              shippingCountry
          ) {
            return false;
          }

          // ============================================
          // ITEM COUNT
          // ============================================

          if (
            pendingOrder
              .items.length !==
            orderItems.length
          ) {
            return false;
          }

          // ============================================
          // PRODUCTS + QUANTITIES + PRICES
          // ============================================

          const allItemsMatch =
            orderItems.every(
              (
                currentItem
              ) => {
                const existingItem =
                  pendingOrder.items.find(
                    (
                      pendingItem
                    ) =>
                      pendingItem
                        .productId ===
                      currentItem
                        .productId
                  );

                if (
                  !existingItem
                ) {
                  return false;
                }

                return (
                  existingItem
                    .sellerId ===
                    currentItem
                      .sellerId &&
                  existingItem
                    .quantity ===
                    currentItem
                      .quantity &&
                  sameMoney(
                    existingItem
                      .unitPrice,
                    currentItem
                      .unitPrice
                  ) &&
                  sameMoney(
                    existingItem
                      .lineTotal,
                    currentItem
                      .lineTotal
                  )
                );
              }
            );

          return allItemsMatch;
        }
      );

    // ==================================================
    // REUSE EXISTING PENDING ORDER
    // ==================================================

    if (
      reusableOrder
    ) {
      console.log(
        `♻️ Reusing pending order ${reusableOrder.id} for user ${userId}`
      );

      return reusableOrder;
    }

    // ==================================================
    // CREATE ORDER + ITEMS
    // ==================================================

    const order =
      await prisma.order.create({
        data: {
          userId,

          status:
            "PENDING_PAYMENT",

          paymentStatus:
            "PENDING",

          subtotal,

          discount:
            couponDiscount,

          shippingAmount,

          totalAmount,

          couponId,

          couponCode,

          couponSellerId,

          couponDiscount,

          contactEmail,

          contactPhone,

          shippingFullName,

          shippingAddressLine1,

          shippingAddressLine2,

          shippingCity,

          shippingState,

          shippingPostalCode,

          shippingCountry,

          items: {
            create:
              orderItems,
          },
        },

        include: {
          items: true,
        },
      });

    console.log(
      `🧾 Created pending order ${order.id} for user ${userId}`
    );
    await sendOrderCreatedEvent(
  order
);

    // ==================================================
    // IMPORTANT
    // ==================================================

    // DO NOT:
    //
    // - clear cart
    // - reduce product stock
    // - increment coupon usedCount
    //
    // Those operations happen only after successful
    // payment verification.

    return order;
  };

// ======================================================
// GET USER ORDER BY ID
// ======================================================

export const getOrderById =
  async (
    userId: string,
    orderId: string
  ) => {
    // ==================================================
    // VALIDATE ORDER ID
    // ==================================================

    const normalizedOrderId =
      normalizeString(
        orderId
      );

    if (
      !normalizedOrderId
    ) {
      throw new BadRequestError(
        "Order ID is required"
      );
    }

    // ==================================================
    // LOAD AUTHENTICATED USER'S ORDER
    // ==================================================

    const order =
      await prisma.order.findFirst({
        where: {
          id:
            normalizedOrderId,

          userId,
        },

        include: {
          items: {
            orderBy: {
              createdAt:
                "asc",
            },
          },
        },
      });

    if (!order) {
      throw new NotFoundError(
        "Order not found"
      );
    }

    return order;
  };

  // ======================================================
// GET SELLER ORDERS
// ======================================================

export const getSellerOrders =
  async (
    sellerId: string,
    query: SellerOrderListQuery = {}
  ): Promise<SellerOrderListResult> => {
    // ==================================================
    // VALIDATE SELLER ID
    // ==================================================

    const normalizedSellerId =
      normalizeString(sellerId);

    if (!normalizedSellerId) {
      throw new BadRequestError(
        "Seller ID is required"
      );
    }

    // ==================================================
    // VERIFY SELLER
    // ==================================================

    const seller =
      await prisma.sellers.findUnique({
        where: {
          id: normalizedSellerId,
        },

        select: {
          id: true,
        },
      });

    if (!seller) {
      throw new NotFoundError(
        "Seller not found"
      );
    }

    // ==================================================
    // NORMALIZE PAGINATION
    // ==================================================

    const requestedPage =
      Number(query.page);

    const requestedLimit =
      Number(query.limit);

    const page =
      Number.isInteger(requestedPage) &&
      requestedPage > 0
        ? requestedPage
        : 1;

    const limit =
      Number.isInteger(requestedLimit) &&
      requestedLimit > 0
        ? Math.min(
            requestedLimit,
            50
          )
        : 10;

    const skip =
      (page - 1) * limit;

    // ==================================================
    // NORMALIZE FILTERS
    // ==================================================

    const search =
      normalizeString(
        query.search
      );

    const where = {
      paymentStatus:
        query.paymentStatus ??
        ("PAID" as const),

      ...(query.orderStatus
        ? {
            status:
              query.orderStatus,
          }
        : {}),

      AND: [
        {
          items: {
            some: {
              sellerId:
                normalizedSellerId,
            },
          },
        },

        ...(search
          ? [
              {
                OR: [
                  {
                    shippingFullName: {
                      contains:
                        search,
                      mode:
                        "insensitive" as const,
                    },
                  },

                  {
                    contactEmail: {
                      contains:
                        search,
                      mode:
                        "insensitive" as const,
                    },
                  },

                  {
                    contactPhone: {
                      contains:
                        search,
                    },
                  },

                  {
                    items: {
                      some: {
                        sellerId:
                          normalizedSellerId,

                        productTitle: {
                          contains:
                            search,
                          mode:
                            "insensitive" as const,
                        },
                      },
                    },
                  },

                  {
                    items: {
                      some: {
                        sellerId:
                          normalizedSellerId,

                        productSku: {
                          contains:
                            search,
                          mode:
                            "insensitive" as const,
                        },
                      },
                    },
                  },
                ],
              },
            ]
          : []),
      ],
    };

    // ==================================================
    // LOAD SELLER-SPECIFIC ORDERS
    // ==================================================

    const [
      totalOrders,
      orders,
    ] = await prisma.$transaction([
      prisma.order.count({
        where,
      }),

      prisma.order.findMany({
        where,

        orderBy: {
          createdAt:
            "desc",
        },

        skip,
        take: limit,

        select: {
          id: true,

          status: true,
          paymentStatus: true,

          couponCode: true,
          couponSellerId: true,
          couponDiscount: true,

          shippingFullName:
            true,
          shippingCity:
            true,
          shippingState:
            true,
          shippingCountry:
            true,

          paymentProvider:
            true,
          paymentVerifiedAt:
            true,

          createdAt: true,
          updatedAt: true,

          items: {
            where: {
              sellerId:
                normalizedSellerId,
            },

            orderBy: {
              createdAt:
                "asc",
            },

            select: {
              id: true,
              productId: true,
              productTitle:
                true,
              productSlug:
                true,
              productImage:
                true,
              productSku:
                true,
              unitPrice: true,
              quantity: true,
              lineTotal: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      }),
    ]);

    // ==================================================
    // BUILD SAFE SELLER RESPONSE
    // ==================================================

    const sellerOrders =
      orders.map(
        (order) => {
          const sellerSubtotal =
            roundMoney(
              order.items.reduce(
                (
                  total,
                  item
                ) =>
                  total +
                  item.lineTotal,
                0
              )
            );

          const couponAppliedToSeller =
            order.couponSellerId ===
            normalizedSellerId;

          const sellerDiscount =
            couponAppliedToSeller
              ? roundMoney(
                  Math.min(
                    Math.max(
                      order.couponDiscount,
                      0
                    ),
                    sellerSubtotal
                  )
                )
              : 0;

          const sellerTotal =
            roundMoney(
              Math.max(
                sellerSubtotal -
                  sellerDiscount,
                0
              )
            );

          const totalQuantity =
            order.items.reduce(
              (
                total,
                item
              ) =>
                total +
                item.quantity,
              0
            );

          return {
            id: order.id,

            orderStatus:
              order.status,

            paymentStatus:
              order.paymentStatus,

            customer: {
              fullName:
                order.shippingFullName,

              city:
                order.shippingCity,

              state:
                order.shippingState,

              country:
                order.shippingCountry,
            },

            itemCount:
              order.items.length,

            totalQuantity,

            sellerSubtotal,
            sellerDiscount,
            sellerTotal,

            couponCode:
              couponAppliedToSeller
                ? order.couponCode
                : null,

            couponAppliedToSeller,

            paymentProvider:
              order.paymentProvider,

            paymentVerifiedAt:
              order.paymentVerifiedAt,

            createdAt:
              order.createdAt,

            updatedAt:
              order.updatedAt,

            items:
              order.items,
          };
        }
      );

    const totalPages =
      totalOrders === 0
        ? 0
        : Math.ceil(
            totalOrders /
              limit
          );

    return {
      orders:
        sellerOrders,

      pagination: {
        page,
        limit,
        totalOrders,
        totalPages,

        hasPreviousPage:
          page > 1,

        hasNextPage:
          page < totalPages,
      },
    };
  };