import type { ReactNode } from "react";
import { BookOpen, CloudOff, SearchX } from "lucide-react";

type StatePanelProps = {
  readonly variant?: "empty" | "error" | "search";
  readonly title: string;
  readonly message?: string;
  readonly action?: ReactNode;
  readonly className?: string;
};

const ICONS = {
  empty: BookOpen,
  error: CloudOff,
  search: SearchX,
};

const TONES = {
  empty: "bg-sun-light text-warning",
  error: "bg-error-light text-error",
  search: "bg-accent-light text-accent-dark",
};

/** Friendly empty / error / no-results panel used across the app. */
export default function StatePanel({
  variant = "empty",
  title,
  message,
  action,
  className = "",
}: StatePanelProps) {
  const Icon = ICONS[variant];
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`mx-auto flex max-w-md flex-col items-center px-4 py-14 text-center ${className}`}
    >
      <span
        className={`mb-5 flex h-20 w-20 items-center justify-center rounded-full ${TONES[variant]}`}
      >
        <Icon className="h-9 w-9" aria-hidden="true" />
      </span>
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      {message && <p className="mt-2 text-ink-soft">{message}</p>}
      {action && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>
      )}
    </div>
  );
}
