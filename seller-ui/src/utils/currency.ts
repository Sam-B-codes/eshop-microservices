export const formatINR = (
  amount: number | null | undefined
) => {
  const value =
    typeof amount === "number" &&
    Number.isFinite(amount)
      ? amount
      : 0;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};