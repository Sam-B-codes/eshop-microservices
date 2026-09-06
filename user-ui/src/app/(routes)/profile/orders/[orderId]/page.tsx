import UserOrderDetails from "@/components/orders/UserOrderDetails";

interface OrderDetailsPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function OrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
  const { orderId } = await params;

  return (
    <UserOrderDetails orderId={orderId} />
  );
}