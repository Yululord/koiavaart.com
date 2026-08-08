/**
 * Prices are stored as plain numbers in euros, so every painting renders the
 * same way whoever typed it in — no stray symbols, spacing or thousands
 * separators to go inconsistent between one work and the next.
 */
export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: Number.isInteger(price) ? 0 : 2,
  }).format(price);
}
