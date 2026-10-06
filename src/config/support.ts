/**
 * Customer support contact shown on order pages.
 * Set SUPPORT_PHONE (e.g. "+256 700 000 000"); while it is empty the contact
 * line is simply left out.
 */
export const SUPPORT_PHONE: string = "";

export const SUPPORT_TEL_HREF = SUPPORT_PHONE
  ? `tel:${SUPPORT_PHONE.replace(/[^\d+]/g, "")}`
  : "";

/** wa.me link to the seller with a prefilled message, or "" if no number is set. */
export const whatsappLink = (message: string): string => {
  const digits = SUPPORT_PHONE.replace(/\D/g, "");
  return digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
    : "";
};
