/**
 * Normalises a backend date string to UTC, then formats it in the user's
 * local timezone and locale.
 *
 * Backend strings that lack a timezone suffix (e.g. "2024-01-15T10:30:00")
 * are treated as UTC by appending "Z" before parsing.
 */
function toLocalDate(dateString?: string | null): Date | null {
  if (!dateString) return null;
  const normalized = /[Zz]$|[+-]\d{2}:\d{2}$/.test(dateString)
    ? dateString
    : `${dateString}Z`;
  const date = new Date(normalized);
  return isNaN(date.getTime()) ? null : date;
}

/** Date + time — e.g. "Jan 15, 2024, 01:30 PM" */
export function formatLocalDateTime(dateString?: string | null): string {
  const date = toLocalDate(dateString);
  if (!date) return "N/A";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Date only — e.g. "Jan 15, 2024" */
export function formatLocalDate(dateString?: string | null): string {
  const date = toLocalDate(dateString);
  if (!date) return "N/A";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Long date — e.g. "January 15, 2024" */
export function formatLocalDateLong(dateString?: string | null): string {
  const date = toLocalDate(dateString);
  if (!date) return "N/A";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Returns a raw Date object in local time, or null */
export function parseLocalDate(dateString?: string | null): Date | null {
  return toLocalDate(dateString);
}
