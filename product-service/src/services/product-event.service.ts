import {
  publishEvent,
} from "@org/event-client";

interface PublishedProduct {
  id: string;
  sellerId: string;
  title: string;
  slug: string;
  category: string;
  price: number;
  salePrice: number;
  stock: number;
}

interface ViewedProduct {
  id: string;
  sellerId: string;
  slug: string;
  category: string;
}

export const sendProductPublishedEvent =
  async (
    product: PublishedProduct,
  ): Promise<void> => {
    const result =
      await publishEvent({
        type:
          "product.published",

        source:
          "product-service",

        key:
          product.id,

        correlationId:
          product.id,

        data: {
          productId:
            product.id,

          sellerId:
            product.sellerId,

          title:
            product.title,

          slug:
            product.slug,

          category:
            product.category,

          price:
            product.price,

          salePrice:
            product.salePrice,

          stock:
            product.stock,
        },
      });

    if (!result.published) {
      console.error(
        `[PRODUCT] Kafka product.published event failed for ${product.id}:`,
        result.error,
      );
    }
  };

export const sendProductViewedEvent =
  async (
    product: ViewedProduct,
  ): Promise<void> => {
    const result =
      await publishEvent({
        type:
          "product.viewed",

        source:
          "product-service",

        key:
          product.id,

        correlationId:
          product.id,

        data: {
          productId:
            product.id,

          sellerId:
            product.sellerId,

          slug:
            product.slug,

          category:
            product.category,
        },
      });

    if (!result.published) {
      console.error(
        `[PRODUCT] Kafka product.viewed event failed for ${product.id}:`,
        result.error,
      );
    }
  };