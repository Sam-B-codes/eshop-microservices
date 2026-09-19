export {
  disconnectEventProducer,
  getKafkaClient,
  getTopicForEvent,
  publishEvent,
} from "./lib/event-client.js";

export {
  KAFKA_TOPICS,
} from "./lib/event.types.js";

export type {
  ChatMessageSentEvent,
  EshopEventMap,
  EshopEventType,
  EventEnvelope,
  EventSource,
  KafkaTopic,
  OrderCreatedEvent,
  OrderStatusUpdatedEvent,
  PaymentCompletedEvent,
  ProductPublishedEvent,
  ProductViewedEvent,
  PublishEventInput,
  PublishEventResult,
  SettlementCompletedEvent,
} from "./lib/event.types.js";