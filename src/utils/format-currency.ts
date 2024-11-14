import Decimal from "decimal.js";

/**
 * Format a number as currency using Decimal for precise calculations.
 *
 * @param {number | Decimal} amount - The amount to format, can be a number or a Decimal instance.
 * @param {string} [locale="id-ID"] - The locale string to use for formatting. Defaults to "id-ID".
 * @param {string} [currency="IDR"] - The currency code to use for formatting. Defaults to "IDR".
 * @param {number} [maximumFractionDigits=0] - The maximum number of decimal places to include. Defaults to 0.
 * @param {Decimal.Rounding} [rounding=Decimal.ROUND_FLOOR] - The rounding mode to use. Defaults to Decimal.ROUND_FLOOR.
 * @returns {string} - The formatted currency string with non-breaking space(\u00A0)
 *
 * @example
 * formatCurrency(1234567.89); // "Rp 1.234.568"
 */
export const formatCurrency = (
  amount: number | Decimal, // Accept both number and Decimal types
  locale = "id-ID",
  currency = "IDR",
  maximumFractionDigits = 0,
  rounding: Decimal.Rounding = Decimal.ROUND_FLOOR
) => {
  // Ensure amount is a Decimal
  const decimalAmount = Decimal.isDecimal(amount)
    ? amount
    : new Decimal(amount);

  // Round the Decimal amount down to the specified number of decimal places
  const roundedAmount = decimalAmount.toFixed(maximumFractionDigits, rounding);

  // Format the Decimal amount as a currency string
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits,
  }).format(Number(roundedAmount)); // Convert back to number for formatting
};

export default formatCurrency;
