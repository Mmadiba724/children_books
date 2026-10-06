import { useEffect, useRef, type ReactNode } from "react";
import { CheckCircle2, MessageCircle, PhoneCall } from "lucide-react";
import { SUPPORT_PHONE, whatsappLink } from "../config/support";

export type CompletedOrder = {
  readonly id: number | string;
  readonly hasPhysical: boolean;
  readonly hasDigital: boolean;
  readonly outsideKampala: boolean;
};

type OrderCompleteModalProps = {
  readonly order: CompletedOrder;
  readonly onViewOrders: () => void;
  readonly onBrowse: () => void;
};

function Step({
  n,
  children,
}: {
  readonly n: number;
  readonly children: ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-extrabold text-white"
        aria-hidden="true"
      >
        {n}
      </span>
      <div className="min-w-0 text-sm text-ink-soft">{children}</div>
    </li>
  );
}

/**
 * Shown after an order is placed. It cannot be dismissed with Esc or the
 * backdrop: the customer picks one of the two buttons, so they never end up
 * on an empty checkout page.
 */
export default function OrderCompleteModal({
  order,
  onViewOrders,
  onBrowse,
}: OrderCompleteModalProps) {
  const primaryRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    primaryRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Keep Tab inside the dialog
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])",
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const waHref = whatsappLink(
    `Hello, I've just placed order #${order.id} on Book Jungle and would like to arrange delivery.`,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-ink/60" aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-complete-title"
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-(--shadow-lift) sm:rounded-3xl"
      >
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-8 sm:px-8">
          <div className="text-center">
            <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-light text-success">
              <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
            </span>
            <h2
              id="order-complete-title"
              className="font-display text-2xl font-extrabold text-ink"
            >
              Thank you, your order is in!
            </h2>
            <p className="mt-1 text-sm font-semibold text-muted">
              Order #{order.id}
            </p>
          </div>

          {order.hasPhysical ? (
            <section aria-label="What happens next">
              <h3 className="mb-3 text-xs font-bold tracking-wide text-muted uppercase">
                What happens next
              </h3>
              <ol className="space-y-4">
                <Step n={1}>
                  <p>
                    <span className="font-bold text-ink">
                      We confirm your payment.
                    </span>{" "}
                    We check the transaction ID you entered and approve your
                    order.
                  </p>
                </Step>
                <Step n={2}>
                  {SUPPORT_PHONE ? (
                    <p>
                      <span className="font-bold text-ink">
                        Message us on WhatsApp
                      </span>{" "}
                      with your order number so we can arrange your delivery.
                      Our number is{" "}
                      <span className="font-bold text-ink">{SUPPORT_PHONE}</span>
                      .
                    </p>
                  ) : (
                    <p>
                      <span className="font-bold text-ink">
                        We'll get in touch
                      </span>{" "}
                      using the details on your account to arrange your
                      delivery.
                    </p>
                  )}
                </Step>
                <Step n={3}>
                  <p>
                    <span className="font-bold text-ink">
                      Our team will call you
                    </span>{" "}
                    to agree on delivery, usually within 5-7 business days.
                    {order.outsideKampala &&
                      " Shipping outside Kampala is agreed with you on the call."}
                  </p>
                </Step>
              </ol>
              {order.hasDigital && (
                <p className="mt-4 rounded-xl bg-accent-light px-4 py-3 text-sm text-accent-dark">
                  Your digital books will appear in My Library as soon as your
                  order is approved.
                </p>
              )}
            </section>
          ) : (
            <section
              aria-label="What happens next"
              className="rounded-2xl bg-accent-light px-5 py-4 text-sm text-accent-dark"
            >
              <p className="font-bold">We're confirming your payment.</p>
              <p className="mt-1">
                As soon as your order is approved, your ebook appears in My
                Library, ready to read on any screen. This usually doesn't take
                long.
              </p>
              {SUPPORT_PHONE && (
                <p className="mt-2">
                  Need help? Message us on WhatsApp at{" "}
                  <span className="font-bold">{SUPPORT_PHONE}</span> with your
                  order number.
                </p>
              )}
            </section>
          )}

          {waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="kb-btn kb-btn-teal w-full"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              Chat with us on WhatsApp
            </a>
          )}
          {order.hasPhysical && !waHref && (
            <p className="flex items-center justify-center gap-2 text-xs text-muted">
              <PhoneCall className="h-4 w-4" aria-hidden="true" />
              Keep your phone nearby, we'll reach out soon.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-line bg-cream/60 px-6 py-4 sm:flex-row-reverse sm:px-8">
          <button
            ref={primaryRef}
            type="button"
            onClick={onViewOrders}
            className="kb-btn kb-btn-primary flex-1"
          >
            View my orders
          </button>
          <button
            type="button"
            onClick={onBrowse}
            className="kb-btn kb-btn-secondary flex-1"
          >
            Browse more books
          </button>
        </div>
      </div>
    </div>
  );
}
