// // ======================================================
// // KAFKA TOPICS
// // ======================================================

// export const KAFKA_TOPICS = {
//   ORDERS: "eshop.orders",
//   PAYMENTS: "eshop.payments",
//   PRODUCTS: "eshop.products",
//   CHATS: "eshop.chats",
//   SETTLEMENTS: "eshop.settlements",
// } as const;

// export type KafkaTopic =
//   (typeof KAFKA_TOPICS)[keyof typeof KAFKA_TOPICS];

// // ======================================================
// // EVENT NAMES
// // ======================================================

// export type EshopEventType =
//   | "order.created"
//   | "order.status.updated"
//   | "payment.completed"
//   | "product.viewed"
//   | "product.published"
//   | "chat.message.sent"
//   | "settlement.completed";

// export type EventSource =
//   | "order-service"
//   | "payment-service"
//   | "product-service"
//   | "chat-service"
//   | "admin-service";

// // ======================================================
// // EVENT PAYLOADS
// // ======================================================

// export interface OrderCreatedEvent {
//   orderId: string;
//   userId: string;
//   sellerIds: string[];
//   itemCount: number;
//   totalAmount: number;
//   paymentStatus: string;
//   orderStatus: string;
// }

// export interface OrderStatusUpdatedEvent {
//   orderId: string;
//   userId: string;
//   sellerOrderId?: string;
//   sellerId?: string;
//   previousStatus: string;
//   status: string;
// }

// export interface PaymentCompletedEvent {
//   orderId: string;
//   userId: string;
//   paymentId: string;
//   paymentProvider: string;
//   amount: number;
//   currency: string;
// }

// export interface ProductViewedEvent {
//   productId: string;
//   sellerId: string;
//   userId?: string;
//   sessionId?: string;
// }

// export interface ProductPublishedEvent {
//   productId: string;
//   sellerId: string;
//   title: string;
//   category: string;
//   salePrice: number;
// }

// export interface ChatMessageSentEvent {
//   messageId: string;
//   conversationId: string;
//   orderId: string;
//   senderId: string;
//   senderRole: "USER" | "SELLER";
//   recipientId: string;
//   recipientRole: "USER" | "SELLER";
// }

// export interface SettlementCompletedEvent {
//   settlementId: string;
//   orderId: string;
//   sellerOrderId: string;
//   sellerId: string;
//   sellerEarnings: number;
//   currency: string;
// }

// // ======================================================
// // EVENT MAP
// // ======================================================

// export interface EshopEventMap {
//   "order.created": OrderCreatedEvent;
//   "order.status.updated": OrderStatusUpdatedEvent;
//   "payment.completed": PaymentCompletedEvent;
//   "product.viewed": ProductViewedEvent;
//   "product.published": ProductPublishedEvent;
//   "chat.message.sent": ChatMessageSentEvent;
//   "settlement.completed": SettlementCompletedEvent;
// }

// // ======================================================
// // EVENT ENVELOPE
// // ======================================================

// export interface EventEnvelope<
//   Type extends EshopEventType = EshopEventType,
// > {
//   id: string;
//   type: Type;
//   version: 1;
//   source: EventSource;
//   occurredAt: string;
//   correlationId: string | null;
//   data: EshopEventMap[Type];
// }

// // ======================================================
// // PUBLISH INPUT / RESULT
// // ======================================================

// export interface PublishEventInput<
//   Type extends EshopEventType,
// > {
//   type: Type;
//   source: EventSource;
//   key: string;
//   data: EshopEventMap[Type];
//   correlationId?: string | null;
// }

// export interface PublishEventResult {
//   published: boolean;
//   eventId: string;
//   topic: KafkaTopic;
//   error?: string;
// }

// ======================================================
// KAFKA TOPICS
// ======================================================

export const KAFKA_TOPICS = {
  ORDERS:
    "eshop.orders",

  PAYMENTS:
    "eshop.payments",

  PRODUCTS:
    "eshop.products",

  CHATS:
    "eshop.chats",

  SETTLEMENTS:
    "eshop.settlements",
} as const;

export type KafkaTopic =
  (typeof KAFKA_TOPICS)[keyof typeof KAFKA_TOPICS];

// ======================================================
// EVENT NAMES
// ======================================================

export type EshopEventType =
  | "order.created"
  | "order.status.updated"
  | "payment.completed"
  | "product.viewed"
  | "product.published"
  | "chat.message.sent"
  | "settlement.completed";

export type EventSource =
  | "order-service"
  | "payment-service"
  | "product-service"
  | "chat-service"
  | "admin-service";

// ======================================================
// ORDER CREATED
// ======================================================

export interface OrderCreatedEvent {
  orderId: string;

  userId: string;

  status: string;

  paymentStatus: string;

  subtotal: number;

  discount: number;

  shippingAmount: number;

  totalAmount: number;

  currency: string;

  itemCount: number;

  totalQuantity: number;

  sellerIds: string[];
}

// ======================================================
// ORDER STATUS UPDATED
// ======================================================

export interface OrderStatusUpdatedEvent {
  orderId: string;

  sellerOrderId: string;

  sellerId: string;

  previousStatus: string;

  status: string;
}

// ======================================================
// PAYMENT COMPLETED
// ======================================================

export interface PaymentCompletedEvent {
  orderId: string;

  userId: string;

  paymentId: string;

  paymentOrderId: string | null;

  provider: string;

  amount: number;

  currency: string;

  verifiedAt: string;
}

// ======================================================
// PRODUCT VIEWED
// ======================================================

export interface ProductViewedEvent {
  productId: string;

  sellerId: string;

  slug: string;

  category: string;
}

// ======================================================
// PRODUCT PUBLISHED
// ======================================================

export interface ProductPublishedEvent {
  productId: string;

  sellerId: string;

  title: string;

  slug: string;

  category: string;

  price: number;

  salePrice: number;

  stock: number;
}

// ======================================================
// CHAT MESSAGE SENT
// ======================================================

export interface ChatMessageSentEvent {
  messageId: string;

  conversationId: string;

  orderId: string;

  senderId: string;

  senderRole:
    | "USER"
    | "SELLER";

  recipientId: string;

  recipientRole:
    | "USER"
    | "SELLER";
}

// ======================================================
// SETTLEMENT COMPLETED
// ======================================================

export interface SettlementCompletedEvent {
  settlementId: string;

  orderId: string;

  sellerOrderId: string;

  sellerId: string;

  sellerEarnings: number;

  platformFee: number;

  currency: string;

  settledAt: string;
}

// ======================================================
// EVENT MAP
// ======================================================

export interface EshopEventMap {
  "order.created":
    OrderCreatedEvent;

  "order.status.updated":
    OrderStatusUpdatedEvent;

  "payment.completed":
    PaymentCompletedEvent;

  "product.viewed":
    ProductViewedEvent;

  "product.published":
    ProductPublishedEvent;

  "chat.message.sent":
    ChatMessageSentEvent;

  "settlement.completed":
    SettlementCompletedEvent;
}

// ======================================================
// EVENT ENVELOPE
// ======================================================

export interface EventEnvelope<
  Type extends EshopEventType =
    EshopEventType,
> {
  id: string;

  type: Type;

  version: 1;

  source:
    EventSource;

  occurredAt:
    string;

  correlationId:
    string | null;

  data:
    EshopEventMap[Type];
}

// ======================================================
// PUBLISH INPUT
// ======================================================

export interface PublishEventInput<
  Type extends EshopEventType,
> {
  type:
    Type;

  source:
    EventSource;

  key:
    string;

  data:
    EshopEventMap[Type];

  correlationId?:
    string | null;
}

// ======================================================
// PUBLISH RESULT
// ======================================================

export interface PublishEventResult {
  published:
    boolean;

  eventId:
    string;

  topic:
    KafkaTopic;

  error?:
    string;
}