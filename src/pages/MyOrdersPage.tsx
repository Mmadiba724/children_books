import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Filter,
  Package,
  ShoppingBag,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import orderService, { type Order } from "../services/orderService";
import bookService from "../services/bookService";
import { getImageUrl } from "../utils/imageUtils";
import type { Book } from "../types/book";
import { formatLocalDateTime } from "../utils/dateUtils";
import PageTransition from "../components/PageTransition";
import { OrderNextSteps } from "../components/OrderNextSteps";
import { getNextStep } from "../utils/orderNextStep";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 5;

type TabId = "ongoing" | "closed";

const TABS: { id: TabId; label: string; statuses: string[] }[] = [
  { id: "ongoing", label: "Ongoing / Paid", statuses: ["PENDING", "PAID"] },
  {
    id: "closed",
    label: "Cancelled / Rejected",
    statuses: ["REJECTED", "FAILED", "CANCELLED"],
  },
];

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-warning-light text-warning",
  PAID: "bg-success-light text-success",
  REJECTED: "bg-error-light text-error",
  FAILED: "bg-error-light text-error",
  CANCELLED: "bg-cream-deep text-ink-soft",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  REJECTED: "Rejected",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
};

const ugx = (n: number | undefined | null) =>
  `UGX ${Number(n ?? 0).toLocaleString()}`;

// 14-03-2026
const shortDate = (value: string) =>
  new Date(value).toLocaleDateString("en-GB").split("/").join("-");

function StatusPill({ status }: { readonly status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES[status] ?? "bg-cream-deep text-ink"}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full bg-current"
        aria-hidden="true"
      />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function OrdersPagination({
  page,
  pageCount,
  total,
  pageSize,
  onChange,
}: {
  readonly page: number;
  readonly pageCount: number;
  readonly total: number;
  readonly pageSize: number;
  readonly onChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;
  const from = page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);
  return (
    <nav
      aria-label="Orders pagination"
      className="flex flex-col items-center justify-between gap-3 border-t border-line px-5 py-4 sm:flex-row sm:px-7"
    >
      <p className="text-sm text-ink-soft">
        Showing <span className="font-bold text-ink">{from}-{to}</span> of{" "}
        <span className="font-bold text-ink">{total}</span> orders
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="kb-btn kb-btn-secondary kb-btn-sm"
          disabled={page === 0}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Previous
        </button>
        <span className="min-w-20 text-center text-sm font-semibold text-ink-soft">
          {page + 1} / {pageCount}
        </span>
        <button
          type="button"
          className="kb-btn kb-btn-secondary kb-btn-sm"
          disabled={page >= pageCount - 1}
          onClick={() => onChange(page + 1)}
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}

function Cover({
  book,
  className,
}: {
  readonly book?: Book;
  readonly className: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = book?.coverImageUrl ? getImageUrl(book.coverImageUrl) : "";
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-cream-deep ${className}`}
    >
      {src && !failed ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <BookOpen className="h-6 w-6 text-muted" aria-hidden="true" />
      )}
    </div>
  );
}

function OrderDetailsModal({
  order,
  books,
  userPhone,
  onClose,
}: {
  readonly order: Order;
  readonly books: Record<number, Book>;
  readonly userPhone?: string;
  readonly onClose: () => void;
}) {
  const nextStep = getNextStep(order, books, userPhone);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previous?.focus();
    };
  }, []);

  const items = order.items ?? [];
  const itemsTotal = items.reduce(
    (sum, i) => sum + Number(i.price ?? 0) * i.quantity,
    0,
  );
  const label = "text-xs font-semibold tracking-wide text-muted uppercase";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close order details"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-ink/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modal-title"
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div>
            <h2
              id="order-modal-title"
              className="font-display text-xl font-bold text-ink"
            >
              Order #{order.id}
            </h2>
            <p className="mt-0.5 text-sm text-ink-soft">
              Placed {formatLocalDateTime(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill status={order.status} />
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-cream focus-visible:outline-2 focus-visible:outline-brand"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
          {nextStep && <OrderNextSteps step={nextStep} />}

          {/* Items */}
          <section aria-label="Items">
            <h3 className={`${label} mb-3`}>Items ({items.length})</h3>
            <ul className="divide-y divide-line-soft rounded-xl border border-line">
              {items.map((item) => {
                const book = books[item.bookId];
                const title =
                  book?.title ?? item.title ?? `Book #${item.bookId}`;
                const author = book?.author ?? item.author;
                const price = Number(item.price ?? 0);
                return (
                  <li
                    key={`${item.id ?? item.bookId}`}
                    className="flex gap-4 p-4"
                  >
                    <Cover book={book} className="h-20 w-14" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink">{title}</p>
                      {author && (
                        <p className="text-sm text-ink-soft">by {author}</p>
                      )}
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {book?.format && (
                          <span className="rounded bg-cream-deep px-2 py-0.5 text-xs font-medium text-ink-soft capitalize">
                            {book.format.toLowerCase()}
                          </span>
                        )}
                        {book?.categoryNames?.slice(0, 2).map((c) => (
                          <span
                            key={c}
                            className="rounded bg-cream-deep px-2 py-0.5 text-xs font-medium text-ink-soft"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-ink-soft">
                        {ugx(price)} x {item.quantity}
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold text-ink">
                      {ugx(price * item.quantity)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Payment */}
          <section aria-label="Payment" className="grid gap-5 sm:grid-cols-2">
            <div>
              <h3 className={`${label} mb-2`}>Payment</h3>
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-soft">Items subtotal</dt>
                  <dd className="font-medium text-ink">{ugx(itemsTotal)}</dd>
                </div>
                <div className="flex justify-between gap-3 border-t border-line pt-1.5">
                  <dt className="font-semibold text-ink">Order total</dt>
                  <dd className="font-bold text-brand">
                    {ugx(order.totalAmount)}
                  </dd>
                </div>
                {order.paymentStatus && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-soft">Payment status</dt>
                    <dd className="font-medium text-ink capitalize">
                      {order.paymentStatus.toLowerCase()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div>
              <h3 className={`${label} mb-2`}>Transaction</h3>
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-soft">Transaction ID</dt>
                  <dd className="font-mono font-medium break-all text-ink">
                    {order.transactionId || "Not provided"}
                  </dd>
                </div>
                {order.verifiedAt && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-soft">Verified</dt>
                    <dd className="text-right font-medium text-ink">
                      {formatLocalDateTime(order.verifiedAt)}
                    </dd>
                  </div>
                )}
                {order.updatedAt && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-soft">Last updated</dt>
                    <dd className="text-right font-medium text-ink">
                      {formatLocalDateTime(order.updatedAt)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </section>

          {/* Delivery */}
          {(order.shippingAddress ||
            order.trackingNumber ||
            order.estimatedDelivery) && (
            <section aria-label="Delivery">
              <h3 className={`${label} mb-2`}>Delivery</h3>
              <dl className="space-y-1.5 text-sm">
                {order.shippingAddress && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-soft">Address</dt>
                    <dd className="text-right font-medium text-ink">
                      {order.shippingAddress}
                    </dd>
                  </div>
                )}
                {order.trackingNumber && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-soft">Tracking number</dt>
                    <dd className="font-mono font-medium text-ink">
                      {order.trackingNumber}
                    </dd>
                  </div>
                )}
                {order.estimatedDelivery && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-soft">Estimated delivery</dt>
                    <dd className="font-medium text-ink">
                      {formatLocalDateTime(order.estimatedDelivery)}
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          {order.rejectionReason && (
            <p className="rounded-lg bg-error-light px-4 py-3 text-sm text-error">
              <span className="font-semibold">Reason: </span>
              {order.rejectionReason}
            </p>
          )}
        </div>

        <div className="border-t border-line px-5 py-3 text-right sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="kb-btn kb-btn-secondary kb-btn-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const MyOrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [books, setBooks] = useState<Record<number, Book>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>("ongoing");
  const [page, setPage] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await orderService.getMyOrders();

      // API returns: { success, data: { content: Order[], ... }, timestamp }
      let ordersData: Order[] = [];
      if (response && "data" in response) {
        const data = (response as { data: unknown }).data;
        if (data && typeof data === "object" && "content" in data) {
          const content = (data as { content: unknown }).content;
          if (Array.isArray(content)) ordersData = content;
        }
      }
      setOrders(ordersData);

      // Fetch book details for every book in the orders
      const bookIds = new Set<number>();
      ordersData.forEach((o) => o.items?.forEach((i) => bookIds.add(i.bookId)));
      const entries = await Promise.all(
        Array.from(bookIds).map(async (id) => {
          try {
            return [id, await bookService.getBookById(id)] as const;
          } catch (error) {
            console.error(`Failed to load book ${id}:`, error);
            return null;
          }
        }),
      );
      setBooks(
        Object.fromEntries(entries.filter((e) => e !== null)) as Record<
          number,
          Book
        >,
      );
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast.error("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const dateFiltered = useMemo(() => {
    if (!startDate && !endDate) return orders;
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);
    return orders.filter((o) => {
      const d = new Date(o.createdAt);
      return (!start || d >= start) && (!end || d <= end);
    });
  }, [orders, startDate, endDate]);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        TABS.map((t) => [
          t.id,
          dateFiltered.filter((o) => t.statuses.includes(o.status)).length,
        ]),
      ) as Record<TabId, number>,
    [dateFiltered],
  );

  const activeTab = TABS.find((t) => t.id === tab) ?? TABS[0];
  const visible = dateFiltered.filter((o) =>
    activeTab.statuses.includes(o.status),
  );
  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = visible.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE,
  );
  const selected = orders.find((o) => o.id === selectedId) ?? null;
  const hasDateFilter = Boolean(startDate || endDate);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setPage(0);
  };

  const header = (
    <header className="kb-paper border-b border-line py-8 text-left md:py-12">
      <div className="kb-container">
        <p className="kb-eyebrow mb-1 flex items-center gap-1.5">
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          Your purchases
        </p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
          My orders
        </h1>
        <p className="mt-2 text-ink-soft">
          Track every order and see exactly what you bought.
        </p>
      </div>
    </header>
  );

  if (loading) {
    return (
      <PageTransition>
        <div>
          {header}
          <div className="kb-container py-8 md:py-12">
            <div
              className="kb-card space-y-4 p-5 sm:p-7"
              role="status"
              aria-label="Loading your orders"
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex gap-5 rounded-2xl border border-line p-5"
                >
                  <div className="kb-skeleton h-28 w-24 shrink-0 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <div className="kb-skeleton h-5 w-2/3" />
                    <div className="kb-skeleton h-4 w-1/3" />
                    <div className="kb-skeleton h-6 w-24 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div>
        {header}
        <div className="kb-container py-8 md:py-12">
          <div className="kb-card">
            {/* Tabs + date filter */}
            <div className="relative flex items-center justify-between gap-3 border-b border-line px-5 sm:px-7">
              <div
                role="tablist"
                aria-label="Order groups"
                className="hide-scrollbar flex gap-6 overflow-x-auto sm:gap-8"
              >
                {TABS.map((t) => {
                  const on = t.id === tab;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      onClick={() => {
                        setTab(t.id);
                        setPage(0);
                      }}
                      className={`-mb-px flex shrink-0 items-center gap-2 border-b-[3px] py-4 text-base font-bold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand ${
                        on
                          ? "border-brand text-ink"
                          : "border-transparent text-muted hover:text-ink"
                      }`}
                    >
                      {t.label}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          on
                            ? "bg-brand text-white"
                            : "bg-cream-deep text-ink-soft"
                        }`}
                      >
                        {counts[t.id]}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setIsFilterOpen((o) => !o)}
                aria-expanded={isFilterOpen}
                className="kb-btn kb-btn-secondary kb-btn-sm shrink-0"
              >
                <Filter className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Filter by date</span>
                {hasDateFilter && (
                  <span className="rounded-full bg-brand px-1.5 text-xs font-bold text-white">
                    {[startDate, endDate].filter(Boolean).length}
                  </span>
                )}
              </button>

              {isFilterOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close filter panel"
                    className="fixed inset-0 z-30 cursor-default"
                    onClick={() => setIsFilterOpen(false)}
                  />
                  <div className="absolute top-full right-5 z-40 mt-2 w-72 rounded-2xl border border-line bg-white p-4 shadow-(--shadow-soft) sm:right-7">
                    <div className="space-y-3">
                      <div>
                        <label
                          htmlFor="startDate"
                          className="mb-1 block text-xs font-bold tracking-wide text-ink-soft uppercase"
                        >
                          From date
                        </label>
                        <input
                          type="date"
                          id="startDate"
                          value={startDate}
                          onChange={(e) => {
                            setStartDate(e.target.value);
                            setPage(0);
                          }}
                          className="kb-input"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="endDate"
                          className="mb-1 block text-xs font-bold tracking-wide text-ink-soft uppercase"
                        >
                          To date
                        </label>
                        <input
                          type="date"
                          id="endDate"
                          value={endDate}
                          onChange={(e) => {
                            setEndDate(e.target.value);
                            setPage(0);
                          }}
                          className="kb-input"
                        />
                      </div>
                      {hasDateFilter && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="kb-btn kb-btn-quiet kb-btn-sm w-full"
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                          Clear dates
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* List */}
            <div className="p-5 sm:p-7">
              {visible.length === 0 ? (
                <div className="flex flex-col items-center px-4 py-14 text-center">
                  <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sun-light text-warning">
                    <Package className="h-8 w-8" aria-hidden="true" />
                  </span>
                  {orders.length === 0 ? (
                    <>
                      <h2 className="font-display text-2xl font-bold">
                        No orders yet
                      </h2>
                      <p className="mt-2 mb-6 text-ink-soft">
                        When you place an order it will show up here.
                      </p>
                      <Link to="/books" className="kb-btn kb-btn-primary">
                        Browse books
                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                      </Link>
                    </>
                  ) : (
                    <>
                      <h2 className="font-display text-2xl font-bold">
                        Nothing here
                      </h2>
                      <p className="mt-2 text-ink-soft">
                        You have no {activeTab.label.toLowerCase()} orders
                        {hasDateFilter ? " in this date range" : ""}.
                      </p>
                      {hasDateFilter && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="kb-btn kb-btn-secondary kb-btn-sm mt-5"
                        >
                          Clear dates
                        </button>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <ul className="space-y-4">
                  {pageItems.map((order) => {
                    const first = order.items?.[0];
                    const book = first ? books[first.bookId] : undefined;
                    const title =
                      book?.title ??
                      first?.title ??
                      (first ? `Book #${first.bookId}` : "Order");
                    const extra = (order.items?.length ?? 0) - 1;
                    const hint = getNextStep(order, books, user?.phone)?.hint;
                    const quantity = (order.items ?? []).reduce(
                      (n, i) => n + i.quantity,
                      0,
                    );
                    return (
                      <li
                        key={order.id}
                        className="flex flex-col gap-4 rounded-2xl border border-line p-4 transition duration-200 hover:border-brand/40 hover:shadow-(--shadow-soft) sm:flex-row sm:items-center sm:gap-6 sm:p-5"
                      >
                        <div className="flex min-w-0 flex-1 gap-4 sm:gap-5">
                          <Cover
                            book={book}
                            className="h-28 w-20 shadow-(--shadow-book) sm:h-32 sm:w-24"
                          />
                          <div className="flex min-w-0 flex-1 flex-col">
                            <h2 className="line-clamp-2 font-display text-lg leading-snug font-bold text-ink">
                              {title}
                            </h2>
                            {extra > 0 && (
                              <p className="text-sm text-ink-soft">
                                + {extra} more {extra === 1 ? "book" : "books"}
                              </p>
                            )}
                            <p className="mt-1 text-sm text-muted">
                              Order #{order.id} · {shortDate(order.createdAt)}
                            </p>
                            <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3">
                              <StatusPill status={order.status} />
                              {hint && (
                                <span className="text-sm font-semibold text-ink-soft">
                                  {hint}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 border-t border-line-soft pt-4 sm:flex-col sm:items-end sm:justify-center sm:gap-3 sm:border-t-0 sm:pt-0">
                          <div className="sm:text-right">
                            <p className="text-xs font-semibold text-muted">
                              {quantity} {quantity === 1 ? "item" : "items"}
                            </p>
                            <p className="text-lg font-extrabold text-ink">
                              {ugx(order.totalAmount)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedId(order.id)}
                            className="kb-btn kb-btn-secondary kb-btn-sm"
                            aria-label={`See details for order ${order.id}`}
                          >
                            See details
                            <ChevronRight
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {visible.length > 0 && (
              <OrdersPagination
                page={safePage}
                pageCount={pageCount}
                total={visible.length}
                pageSize={PAGE_SIZE}
                onChange={(next) => {
                  setPage(next);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            )}
          </div>

          {selected && (
            <OrderDetailsModal
              order={selected}
              books={books}
              userPhone={user?.phone}
              onClose={() => setSelectedId(null)}
            />
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default MyOrdersPage;
