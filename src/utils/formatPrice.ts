/** Formats a UGX amount with thousands separators, e.g. "UGX 15,000". */
export const formatPrice = (amount: number | null | undefined): string =>
  `UGX ${Math.round(amount ?? 0).toLocaleString("en-UG")}`;
