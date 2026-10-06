import type { Order } from "../services/orderService";
import type { Book } from "../types/book";
import { SUPPORT_PHONE } from "../config/support";

export type NextStep = {
  readonly kind: "delivery" | "tracking" | "ebook" | "pending";
  readonly tone: "success" | "warning";
  readonly title: string;
  readonly body: string;
  /** One-line version for the orders list. */
  readonly hint: string;
  readonly showSupport: boolean;
};

/**
 * What the customer should expect next. Statuses are only PENDING/PAID/...
 * (no shipped state), so this is guidance copy rather than live tracking.
 */
export function getNextStep(
  order: Order,
  books: Record<number, Book>,
  userPhone?: string,
): NextStep | null {
  const items = order.items ?? [];

  if (order.status === "PENDING") {
    const physical = items.some((i) => books[i.bookId]?.format === "PHYSICAL");
    return {
      kind: "pending",
      tone: "warning",
      title: "We're confirming your payment",
      body: physical
        ? "This page updates as soon as your order is approved. We'll then call you to arrange delivery."
        : "This page updates as soon as your order is approved, and your book will appear in your library.",
      hint: "Confirming your payment",
      showSupport: false,
    };
  }

  if (order.status !== "PAID") return null;

  // Wait for book details before deciding physical vs digital
  if (items.length === 0 || !items.every((i) => books[i.bookId])) return null;
  const physical = items.some((i) => books[i.bookId].format === "PHYSICAL");

  if (!physical) {
    return {
      kind: "ebook",
      tone: "success",
      title: "Your ebook is ready",
      body: "It's now in your library, ready to read on any screen.",
      hint: "Ready in your library",
      showSupport: false,
    };
  }

  const hasDigital = items.some((i) => books[i.bookId].format !== "PHYSICAL");
  const digitalNote = hasDigital
    ? " Your digital books are already in your library."
    : "";

  if (order.trackingNumber) {
    return {
      kind: "tracking",
      tone: "success",
      title: "Your order is on its way",
      body: `Tracking number ${order.trackingNumber}. We'll call you if we need anything to complete the delivery.${digitalNote}`,
      hint: "On its way to you",
      showSupport: true,
    };
  }

  const contact = userPhone
    ? `Our delivery team will call you on ${userPhone} to arrange delivery, usually within 5-7 business days. For delivery outside Kampala, the call also confirms the shipping cost.`
    : `We don't have a phone number on your account, so please ${SUPPORT_PHONE ? `call or WhatsApp us on ${SUPPORT_PHONE}` : "contact us"} to arrange delivery. Delivery usually takes 5-7 business days, and outside Kampala we'll confirm the shipping cost with you.`;

  return {
    kind: "delivery",
    tone: "success",
    title: "Your order is approved",
    body: `${contact}${digitalNote}`,
    hint: userPhone
      ? "Our team will call you to arrange delivery"
      : "Contact us to arrange delivery",
    showSupport: true,
  };
}
