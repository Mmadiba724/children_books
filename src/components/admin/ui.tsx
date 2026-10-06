import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { adminBtn, adminInput } from "./adminStyles";

/* ---------- Cards ---------- */

export function AdminCard({
  children,
  className = "",
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-line bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  action,
}: {
  readonly title: string;
  readonly action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
      <h2 className="font-display text-base font-bold text-ink">{title}</h2>
      {action}
    </div>
  );
}

/* ---------- Status badge ---------- */

const TONES = {
  neutral: "bg-cream-deep text-ink-soft",
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  error: "bg-error-light text-error",
  info: "bg-sky-light text-info",
  brand: "bg-brand-light text-brand-dark",
  plum: "bg-plum-light text-plum",
} as const;

export type BadgeTone = keyof typeof TONES;

export function StatusBadge({
  tone = "neutral",
  children,
}: {
  readonly tone?: BadgeTone;
  readonly children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

/* ---------- Loading / state helpers ---------- */

export function TableSkeleton({
  rows = 6,
  cols = 4,
}: {
  readonly rows?: number;
  readonly cols?: number;
}) {
  return (
    <div
      className="divide-y divide-line-soft"
      aria-hidden="true"
      role="presentation"
    >
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex items-center gap-4 px-5 py-4">
          <div className="kb-skeleton h-10 w-10 shrink-0 rounded-lg" />
          {Array.from({ length: cols }, (_, c) => (
            <div
              key={c}
              className="kb-skeleton h-4 flex-1"
              style={{ maxWidth: c === 0 ? "14rem" : "8rem" }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function InlineState({
  icon,
  title,
  message,
  action,
  tone = "neutral",
}: {
  readonly icon: ReactNode;
  readonly title: string;
  readonly message?: string;
  readonly action?: ReactNode;
  readonly tone?: "neutral" | "error";
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className="flex flex-col items-center px-4 py-14 text-center"
    >
      <span
        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${tone === "error" ? "bg-error-light text-error" : "bg-cream-deep text-muted"}`}
        aria-hidden="true"
      >
        {icon}
      </span>
      <p className="text-base font-bold text-ink">{title}</p>
      {message && (
        <p className="mt-1 max-w-sm text-sm text-ink-soft">{message}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------- Pagination ---------- */

export function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  onChange,
}: {
  readonly page: number; // zero-based
  readonly pageCount: number;
  readonly total: number;
  readonly pageSize: number;
  readonly onChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;
  const from = page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);
  return (
    <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
      <p className="text-sm text-ink-soft">
        <span className="font-semibold text-ink">
          {from}-{to}
        </span>{" "}
        of <span className="font-semibold text-ink">{total}</span>
      </p>
      <nav aria-label="Pagination" className="flex items-center gap-2">
        <button
          type="button"
          className={adminBtn.secondary}
          disabled={page === 0}
          onClick={() => onChange(page - 1)}
        >
          Previous
        </button>
        <span className="hidden text-sm text-ink-soft sm:inline">
          Page {page + 1} of {pageCount}
        </span>
        <button
          type="button"
          className={adminBtn.secondary}
          disabled={page >= pageCount - 1}
          onClick={() => onChange(page + 1)}
        >
          Next
        </button>
      </nav>
    </div>
  );
}

/* ---------- Confirm dialog ---------- */

type ConfirmDialogProps = {
  readonly open: boolean;
  readonly title: string;
  readonly message: ReactNode;
  readonly confirmLabel?: string;
  readonly tone?: "danger" | "primary";
  /** Renders an optional text field; its trimmed value is passed to onConfirm. */
  readonly reasonLabel?: string;
  readonly onConfirm: (reason: string) => void | Promise<void>;
  readonly onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  tone = "primary",
  reasonLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  useEffect(() => {
    if (!open) return;
    setReason("");
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancelRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm(reason.trim());
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cancel"
        tabIndex={-1}
        onClick={onCancel}
        className="absolute inset-0 bg-ink/50"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="flex gap-4">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone === "danger" ? "bg-error-light text-error" : "bg-brand-light text-brand"}`}
            aria-hidden="true"
          >
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 id="confirm-title" className="text-lg font-bold text-ink">
              {title}
            </h2>
            <div className="mt-1 text-sm text-ink-soft">{message}</div>
          </div>
        </div>
        {reasonLabel && (
          <div className="mt-4">
            <label
              htmlFor="confirm-reason"
              className="mb-1 block text-sm font-semibold text-ink"
            >
              {reasonLabel}
            </label>
            <textarea
              id="confirm-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={adminInput}
            />
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            className={adminBtn.secondary}
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className={tone === "danger" ? adminBtn.danger : adminBtn.primary}
            onClick={handleConfirm}
            disabled={busy}
          >
            {busy && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
