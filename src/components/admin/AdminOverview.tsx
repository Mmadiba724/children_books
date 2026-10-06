import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CloudOff,
  Library,
  PackageX,
  ShoppingBag,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";
import bookService from "../../services/bookService";
import categoryService from "../../services/categoryService";
import userService from "../../services/userService";
import orderService, {
  type AdminOrderMetrics,
  type Order,
} from "../../services/orderService";
import type { Book } from "../../types/book";
import { formatLocalDate } from "../../utils/dateUtils";
import AdminPageHeader from "./AdminPageHeader";
import BookThumb from "./BookThumb";
import type { AdminSection } from "./sections";
import {
  AdminCard,
  CardHeader,
  InlineState,
  StatusBadge,
  type BadgeTone,
} from "./ui";
import { adminBtn } from "./adminStyles";

const LOW_STOCK_THRESHOLD = 5;
const ORDER_TONES: Record<string, BadgeTone> = {
  PENDING: "warning",
  PAID: "success",
  REJECTED: "error",
  FAILED: "error",
  CANCELLED: "neutral",
};

type Slice<T> =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: T };

function useSlice<T>(load: () => Promise<T>) {
  const [slice, setSlice] = useState<Slice<T>>({ status: "loading" });
  const run = useCallback(() => {
    setSlice({ status: "loading" });
    load().then(
      (data) => setSlice({ status: "ready", data }),
      () => setSlice({ status: "error" }),
    );
  }, [load]);
  useEffect(run, [run]);
  return [slice, run] as const;
}

const loadBooks = () => bookService.getAllBooks();
const loadCategories = () => categoryService.getAllCategories();
const loadUserTotal = async () => {
  const res = await userService.getAllUsers(0, 1);
  return res.data?.totalElements ?? 0;
};
const loadMetrics = () => orderService.getSummaryMetrics();
const loadRecentOrders = async () =>
  (await orderService.getAllAdminOrders(undefined, 0, 5)).slice(0, 5);

function StatCard({
  label,
  icon: Icon,
  slice,
  pick,
  hint,
  onClick,
  tone = "text-ink",
}: {
  readonly label: string;
  readonly icon: LucideIcon;
  readonly slice: Slice<unknown>;
  readonly pick: (data: never) => number | string;
  readonly hint?: string;
  readonly onClick?: () => void;
  readonly tone?: string;
}) {
  let value: string;
  if (slice.status === "loading") value = "";
  else if (slice.status === "error") value = "-";
  else value = String(pick(slice.data as never));

  const body = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink-soft">{label}</p>
        <Icon className="h-5 w-5 text-muted" aria-hidden="true" />
      </div>
      {slice.status === "loading" ? (
        <div className="kb-skeleton mt-3 h-8 w-16" aria-hidden="true" />
      ) : (
        <p className={`mt-2 font-display text-3xl font-bold ${tone}`}>
          {value}
        </p>
      )}
      <p className="mt-1 text-xs text-muted">
        {slice.status === "error" ? "Could not load" : hint}
      </p>
    </>
  );

  const cls = "block w-full p-5 text-left";
  return (
    <AdminCard>
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className={`${cls} rounded-xl transition-colors hover:bg-cream focus-visible:outline-2 focus-visible:outline-brand`}
        >
          {body}
        </button>
      ) : (
        <div className={cls}>{body}</div>
      )}
    </AdminCard>
  );
}

function ListState({
  slice,
  onRetry,
  empty,
  children,
}: {
  readonly slice: Slice<unknown[]>;
  readonly onRetry: () => void;
  readonly empty: string;
  readonly children: (items: never[]) => React.ReactNode;
}) {
  if (slice.status === "loading") {
    return (
      <div className="space-y-3 p-5" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="kb-skeleton h-10 w-full" />
        ))}
      </div>
    );
  }
  if (slice.status === "error") {
    return (
      <InlineState
        tone="error"
        icon={<CloudOff className="h-6 w-6" />}
        title="Couldn't load this"
        action={
          <button type="button" className={adminBtn.secondary} onClick={onRetry}>
            Try again
          </button>
        }
      />
    );
  }
  if (slice.data.length === 0) {
    return <p className="px-5 py-10 text-center text-sm text-muted">{empty}</p>;
  }
  return <>{children(slice.data as never[])}</>;
}

export default function AdminOverview({
  onNavigate,
}: {
  readonly onNavigate: (section: AdminSection) => void;
}) {
  const [books, reloadBooks] = useSlice<Book[]>(loadBooks);
  const [categories] = useSlice(loadCategories);
  const [users] = useSlice(loadUserTotal);
  const [metrics] = useSlice<AdminOrderMetrics>(loadMetrics);
  const [recentOrders, reloadOrders] = useSlice<Order[]>(loadRecentOrders);

  const bookList = useMemo(
    () => (books.status === "ready" ? books.data : []),
    [books],
  );

  const recentBooks = useMemo(
    () =>
      [...bookList]
        .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
        .slice(0, 5),
    [bookList],
  );

  const stockAlerts = useMemo(
    () =>
      bookList
        .filter((b) => b.format === "PHYSICAL")
        .filter((b) => b.stockQuantity <= LOW_STOCK_THRESHOLD)
        .sort((a, b) => a.stockQuantity - b.stockQuantity),
    [bookList],
  );

  const physical = bookList.filter((b) => b.format === "PHYSICAL").length;
  const digital = bookList.filter((b) => b.format === "DIGITAL").length;
  const authors = new Set(bookList.map((b) => b.author).filter(Boolean)).size;
  const pending = metrics.status === "ready"
    ? (metrics.data.countsByStatus?.PENDING ?? 0)
    : 0;

  return (
    <>
      <AdminPageHeader
        title="Overview"
        description="The state of the store at a glance."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Books"
          icon={BookOpen}
          slice={books}
          pick={(d: Book[]) => d.length}
          hint={
            books.status === "ready"
              ? `${physical} print, ${digital} digital`
              : undefined
          }
          onClick={() => onNavigate("books")}
        />
        <StatCard
          label="Orders"
          icon={ShoppingBag}
          slice={metrics}
          pick={(d: AdminOrderMetrics) => d.totalOrders}
          hint={pending > 0 ? `${pending} awaiting review` : "None pending"}
          onClick={() => onNavigate("orders")}
        />
        <StatCard
          label="Users"
          icon={Users}
          slice={users}
          pick={(d: number) => d}
          hint="Registered accounts"
          onClick={() => onNavigate("users")}
        />
        <StatCard
          label="Categories"
          icon={Tags}
          slice={categories}
          pick={(d: unknown[]) => d.length}
          hint={
            books.status === "ready" ? `${authors} authors in catalogue` : undefined
          }
          onClick={() => onNavigate("categories")}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <AdminCard className="lg:col-span-2">
          <CardHeader
            title="Recent orders"
            action={
              <button
                type="button"
                className={adminBtn.ghost}
                onClick={() => onNavigate("orders")}
              >
                View all
              </button>
            }
          />
          <ListState
            slice={recentOrders}
            onRetry={reloadOrders}
            empty="No orders yet."
          >
            {(items) => (
              <ul className="divide-y divide-line-soft">
                {(items as Order[]).map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between gap-3 px-5 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">
                        Order #{o.id}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {o.userEmail ?? "Customer"} ·{" "}
                        {formatLocalDate(o.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="hidden text-sm font-semibold text-ink sm:inline">
                        {Number(o.totalAmount).toLocaleString()}
                      </span>
                      <StatusBadge tone={ORDER_TONES[o.status] ?? "neutral"}>
                        {o.status}
                      </StatusBadge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ListState>
        </AdminCard>

        <AdminCard>
          <CardHeader title="Needs attention" />
          <div className="divide-y divide-line-soft">
            <button
              type="button"
              onClick={() => onNavigate("orders")}
              className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-cream focus-visible:outline-2 focus-visible:outline-brand"
            >
              <AlertTriangle
                className={`h-5 w-5 ${pending > 0 ? "text-warning" : "text-muted"}`}
                aria-hidden="true"
              />
              <span className="text-sm text-ink">
                <span className="font-bold">{pending}</span> pending{" "}
                {pending === 1 ? "order" : "orders"}
              </span>
            </button>
            <div className="px-5 py-4">
              <div className="flex items-center gap-3">
                <PackageX
                  className={`h-5 w-5 ${stockAlerts.length > 0 ? "text-error" : "text-muted"}`}
                  aria-hidden="true"
                />
                <p className="text-sm text-ink">
                  <span className="font-bold">{stockAlerts.length}</span> print{" "}
                  {stockAlerts.length === 1 ? "title" : "titles"} low or out of
                  stock
                </p>
              </div>
              {stockAlerts.length > 0 && (
                <ul className="mt-3 space-y-1.5 pl-8">
                  {stockAlerts.slice(0, 4).map((b) => (
                    <li
                      key={b.id}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="truncate text-ink-soft">{b.title}</span>
                      <StatusBadge
                        tone={b.stockQuantity === 0 ? "error" : "warning"}
                      >
                        {b.stockQuantity === 0
                          ? "Out"
                          : `${b.stockQuantity} left`}
                      </StatusBadge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </AdminCard>
      </div>

      <AdminCard className="mt-6">
        <CardHeader
          title="Recently added books"
          action={
            <button
              type="button"
              className={adminBtn.ghost}
              onClick={() => onNavigate("books")}
            >
              Manage books
            </button>
          }
        />
        <ListState slice={books.status === "ready" ? { status: "ready", data: recentBooks } : books} onRetry={reloadBooks} empty="No books yet.">
          {(items) => (
            <ul className="divide-y divide-line-soft">
              {(items as Book[]).map((b) => (
                <li key={b.id} className="flex items-center gap-4 px-5 py-3">
                  <BookThumb title={b.title} coverImageUrl={b.coverImageUrl} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {b.title}
                    </p>
                    <p className="truncate text-xs text-muted">{b.author}</p>
                  </div>
                  <StatusBadge tone={b.format === "DIGITAL" ? "info" : "success"}>
                    {b.format === "DIGITAL" ? "Digital" : "Print"}
                  </StatusBadge>
                  <span className="hidden text-xs text-muted sm:inline">
                    {formatLocalDate(b.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </ListState>
        {books.status === "ready" && books.data.length === 0 && (
          <div className="flex justify-center pb-6">
            <Library className="h-5 w-5 text-muted" aria-hidden="true" />
          </div>
        )}
      </AdminCard>
    </>
  );
}
