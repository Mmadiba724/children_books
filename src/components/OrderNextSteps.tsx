import { Link } from "react-router-dom";
import { BookOpenCheck, Clock, PhoneCall, Truck } from "lucide-react";
import { SUPPORT_PHONE, SUPPORT_TEL_HREF } from "../config/support";
import type { NextStep } from "../utils/orderNextStep";

const ICONS = {
  delivery: PhoneCall,
  tracking: Truck,
  ebook: BookOpenCheck,
  pending: Clock,
} as const;

const TONES = {
  success: "border-success/25 bg-success-light/60 text-success",
  warning: "border-warning/25 bg-warning-light text-warning",
} as const;

export function OrderNextSteps({ step }: { readonly step: NextStep }) {
  const Icon = ICONS[step.kind];
  return (
    <section
      aria-label="What happens next"
      className={`flex gap-3 rounded-xl border p-4 ${TONES[step.tone]}`}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 text-ink">
        <h3 className="font-bold">{step.title}</h3>
        <p className="mt-1 text-sm text-ink-soft">{step.body}</p>
        {step.kind === "ebook" && (
          <Link
            to="/library"
            className="mt-2 inline-block text-sm font-bold text-brand hover:text-brand-dark hover:underline"
          >
            Open my library
          </Link>
        )}
        {step.showSupport && SUPPORT_PHONE && (
          <p className="mt-2 text-sm text-ink-soft">
            Haven't heard from us within 2 days? Call{" "}
            <a
              href={SUPPORT_TEL_HREF}
              className="font-bold text-brand hover:text-brand-dark hover:underline"
            >
              {SUPPORT_PHONE}
            </a>
            .
          </p>
        )}
      </div>
    </section>
  );
}
