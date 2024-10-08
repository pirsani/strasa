import Decimal from "decimal.js";

// Format a number as currency using Decimal for precise calculations
export const formatCurrency = (
  amount: number | Decimal, // Accept both number and Decimal types
  locale = "id-ID",
  currency = "IDR"
) => {
  // Ensure amount is a Decimal
  const decimalAmount = Decimal.isDecimal(amount)
    ? amount
    : new Decimal(amount);

  // Format the Decimal amount as a currency string
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(decimalAmount.toNumber()); // Convert back to number for formatting
};

export default formatCurrency;
