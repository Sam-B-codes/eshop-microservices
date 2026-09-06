import OrderDetailsDashboard from "@/components/dashboard/orders/OrderDetailsDashboard";

interface OrderDetailsPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function OrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
  const {
    orderId,
  } = await params;

  return (
    <OrderDetailsDashboard
      orderId={orderId}
    />
  );
}