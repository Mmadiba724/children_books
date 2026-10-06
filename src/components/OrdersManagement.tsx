import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle,
  CloudOff,
  Eye,
  Hash,
  Loader2,
  MapPin,
  Package,
  SearchX,
  ShoppingBag,
  X,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import orderService, {
  type Order,
  type AdminOrderMetrics,
} from "../services/orderService";
import { formatLocalDateTime } from "../utils/dateUtils";
import TransactionManagement from "./TransactionManagement";
import AdminPageHeader from "./admin/AdminPageHeader";
import AdminToolbar from "./admin/AdminToolbar";
import { fetchAllPages } from "./admin/fetchAll";
import { adminBtn, adminInput } from "./admin/adminStyles";
import {
  AdminCard,
  ConfirmDialog,
  InlineState,
  Pagination,
  StatusBadge,
  TableSkeleton,
  type BadgeTone,
} from "./admin/ui";

type AdminView = "orders" | "transactions";

type StatusFilter =
  | "ALL"
  | "PENDING"
  | "PAID"
  | "REJECTED"
  | "FAILED"
  | "CANCELLED";

const PAGE_SIZE = 8;

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "REJECTED", label: "Rejected" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const ORDER_TONES: Record<string, BadgeTone> = {
  PENDING: "warning",
  PAID: "success",
  REJECTED: "error",
  FAILED: "error",
  CANCELLED: "neutral",
};

const PAYMENT_TONES: Record<string, BadgeTone> = {
  COMPLETED: "success",
  PENDING: "warning",
  FAILED: "error",
  REFUNDED: "neutral",
};

const getTabCount = (
  tab: StatusFilter,
  metrics: AdminOrderMetrics | null,
): number | undefined => {
  if (!metrics) return undefined;
  if (tab === "ALL") return metrics.totalOrders;
  return metrics.countsByStatus?.[tab];
};

type PendingAction = { kind: "approve" | "reject"; orderId: number } | null;

const needsReview = (order: Order) =>
  order.status === "PENDING" ||
  (order.transactionIdMatched === true && order.status !== "PAID");

const itemsSummary = (order: Order) => {
  const items = order.items ?? [];
  if (items.length === 0) return "-";
  const first = items[0].title || `Book #${items[0].bookId}`;
  return items.length === 1 ? first : `${first} +${items.length - 1} more`;
};

function ProofBadge({ order }: { readonly order: Order }) {
  if (!order.transactionId) return <span className="text-xs text-muted">-</span>;
  return order.transactionIdMatched === true ? (
    <StatusBadge tone="success">Verified</StatusBadge>
  ) : (
    <StatusBadge tone="warning">Awaiting</StatusBadge>
  );
}

function ReviewButtons({
  order,
  processing,
  onApprove,
  onReject,
  full = false,
}: {
  readonly order: Order;
  readonly processing: boolean;
  readonly onApprove: (id: number) => void;
  readonly onReject: (id: number) => void;
  readonly full?: boolean;
}) {
  return (
    <>
      {order.transactionIdMatched === true && (
        <button
          type="button"
          onClick={() => onApprove(order.id)}
          disabled={processing || !order.transactionId}
          className={`${adminBtn.primary} ${full ? "w-full" : "px-3 py-1.5"}`}
          aria-label={`Approve order ${order.id}`}
        >
          {processing ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <CheckCircle className="h-4 w-4" aria-hidden="true" />
          )}
          Approve
        </button>
      )}
      <button
        type="button"
        onClick={() => onReject(order.id)}
        disabled={processing}
        className={`${adminBtn.secondary} text-error ${full ? "w-full" : "px-3 py-1.5"}`}
        aria-label={`Reject order ${order.id}`}
      >
        <XCircle className="h-4 w-4" aria-hidden="true" />
        Reject
      </button>
    </>
  );
}

function OrderDetails({
  order,
  processing,
  onApprove,
  onReject,
}: {
  readonly order: Order;
  readonly processing: boolean;
  readonly onApprove: (id: number) => void;
  readonly onReject: (id: number) => void;
}) {
  const heading =
    "mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-muted uppercase";
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone={ORDER_TONES[order.status] ?? "neutral"}>
          {order.status}
        </StatusBadge>
        {order.paymentStatus && (
          <StatusBadge tone={PAYMENT_TONES[order.paymentStatus] ?? "neutral"}>
            Payment {order.paymentStatus.toLowerCase()}
          </StatusBadge>
        )}
        <span className="ml-auto font-display text-lg font-bold text-ink">
          {Number(order.totalAmount).toLocaleString()}
        </span>
      </div>

      {order.userEmail && (
        <p className="text-sm text-ink-soft">
          Customer: <span className="font-semibold text-ink">{order.userEmail}</span>
        </p>
      )}

      {order.items && order.items.length > 0 && (
        <section aria-label="Items">
          <h3 className={heading}>
            <Package className="h-4 w-4" aria-hidden="true" />
            Items ({order.items.length})
          </h3>
          <ul className="divide-y divide-line-soft rounded-lg border border-line">
            {order.items.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start justify-between gap-3 px-4 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {item.title || `Book #${item.bookId}`}
                  </p>
                  {item.author && (
                    <p className="truncate text-xs text-muted">by {item.author}</p>
                  )}
                </div>
                <div className="shrink-0 text-right text-sm">
                  <p className="text-ink-soft">x{item.quantity}</p>
                  {item.price ? (
                    <p className="font-semibold text-ink">
                      {item.price.toLocaleString()}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {order.shippingAddress && (
        <section aria-label="Shipping">
          <h3 className={heading}>
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Shipping address
          </h3>
          <p className="text-sm text-ink">{order.shippingAddress}</p>
        </section>
      )}

      {order.transactionId && (
        <section aria-label="Payment proof">
          <h3 className={heading}>
            <Hash className="h-4 w-4" aria-hidden="true" />
            Transaction ID (entered by customer)
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <code className="rounded-md bg-cream-deep px-3 py-1.5 font-mono text-sm font-bold break-all text-ink">
              {order.transactionId}
            </code>
            {order.transactionIdMatched === true ? (
              <StatusBadge tone="success">Payment proof verified</StatusBadge>
            ) : (
              <StatusBadge tone="warning">Awaiting verification</StatusBadge>
            )}
          </div>
        </section>
      )}

      {order.trackingNumber && (
        <section aria-label="Tracking">
          <h3 className={heading}>Tracking number</h3>
          <code className="rounded-md bg-cream-deep px-3 py-1.5 font-mono text-sm text-ink">
            {order.trackingNumber}
          </code>
        </section>
      )}

      {order.status === "REJECTED" && order.rejectionReason && (
        <p className="rounded-lg bg-error-light px-4 py-3 text-sm text-error">
          Rejected: <span className="italic">"{order.rejectionReason}"</span>
        </p>
      )}

      {needsReview(order) && (
        <section
          aria-label="Review"
          className="space-y-3 rounded-lg border border-line bg-cream/60 p-4"
        >
          {order.transactionIdMatched !== true && (
            <p className="rounded-md bg-warning-light px-3 py-2 text-xs text-warning">
              Waiting for payment. The transaction ID must be verified before
              this order can be approved.
            </p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            <ReviewButtons
              order={order}
              processing={processing}
              onApprove={onApprove}
              onReject={onReject}
              full
            />
          </div>
        </section>
      )}
    </div>
  );
}

function OrderDrawer({
  order,
  processing,
  onClose,
  onApprove,
  onReject,
}: {
  readonly order: Order;
  readonly processing: boolean;
  readonly onClose: () => void;
  readonly onApprove: (id: number) => void;
  readonly onReject: (id: number) => void;
}) {
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

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Close order details"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-ink/50"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-drawer-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div>
            <h2
              id="order-drawer-title"
              className="font-display text-xl font-bold text-ink"
            >
              Order #{order.id}
            </h2>
            <p className="text-xs text-muted">
              {formatLocalDateTime(order.createdAt)}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className={adminBtn.icon}
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <OrderDetails
            order={order}
            processing={processing}
            onApprove={onApprove}
            onReject={onReject}
          />
        </div>
      </aside>
    </div>
  );
}

export default function OrdersManagement() {
  const [adminView, setAdminView] = useState<AdminView>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState<AdminOrderMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState<number | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("PENDING");
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [proofFilter, setProofFilter] = useState("");
  const [pending, setPending] = useState<PendingAction>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadFailed(false);
      // Load every page for this status so search and filters cover all orders
      const all = await fetchAllPages<Order>(async (p, size) => {
        const result = await orderService.getAdminOrdersPage(
          statusFilter === "ALL" ? undefined : statusFilter,
          p,
          size,
        );
        return { items: result.orders, totalPages: result.totalPages };
      });
      setOrders(all);
    } catch (error) {
      setLoadFailed(true);
      toast.error("Failed to load orders");
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  // Metrics are non-critical: tab counts just won't show if this fails
  const fetchMetrics = useCallback(async () => {
    try {
      setMetrics(await orderService.getSummaryMetrics());
    } catch (error) {
      console.error("Error fetching order metrics:", error);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const changeStatus = (next: StatusFilter) => {
    setStatusFilter(next);
    setPage(0);
    setSelectedId(null);
  };

  const runAction = async (reason: string) => {
    if (!pending) return;
    const { kind, orderId } = pending;
    setPending(null);
    setProcessingOrderId(orderId);
    try {
      if (kind === "approve") {
        await orderService.approveOrder(orderId);
        toast.success("Order approved successfully");
      } else {
        await orderService.rejectOrder(orderId, reason || undefined);
        toast.success("Order rejected successfully");
      }
      setSelectedId(null);
      fetchMetrics();
      fetchOrders();
    } catch (error) {
      toast.error(
        kind === "approve" ? "Failed to approve order" : "Failed to reject order",
      );
      console.error(`Error during ${kind}:`, error);
    } finally {
      setProcessingOrderId(null);
    }
  };

  const selected = orders.find((o) => o.id === selectedId) ?? null;

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (proofFilter === "VERIFIED" && o.transactionIdMatched !== true)
        return false;
      if (
        proofFilter === "AWAITING" &&
        !(o.transactionId && o.transactionIdMatched !== true)
      )
        return false;
      if (proofFilter === "NONE" && o.transactionId) return false;
      if (!q) return true;
      return (
        String(o.id).includes(q) ||
        (o.userEmail ?? "").toLowerCase().includes(q) ||
        (o.transactionId ?? "").toLowerCase().includes(q) ||
        (o.items ?? []).some((i) =>
          (i.title ?? "").toLowerCase().includes(q),
        )
      );
    });
  }, [orders, search, proofFilter]);

  const total = visible.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = visible.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE,
  );

  const hasFilters = Boolean(search || proofFilter);
  const clearFilters = () => {
    setSearch("");
    setProofFilter("");
    setPage(0);
  };

  const approve = (orderId: number) => setPending({ kind: "approve", orderId });
  const reject = (orderId: number) => setPending({ kind: "reject", orderId });

  let content;
  if (isLoading) {
    content = <TableSkeleton rows={6} cols={4} />;
  } else if (loadFailed) {
    content = (
      <InlineState
        tone="error"
        icon={<CloudOff className="h-6 w-6" />}
        title="We couldn't load the orders"
        message="Check your connection and try again."
        action={
          <button type="button" className={adminBtn.primary} onClick={fetchOrders}>
            Try again
          </button>
        }
      />
    );
  } else if (orders.length > 0 && visible.length === 0) {
    content = (
      <InlineState
        icon={<SearchX className="h-6 w-6" />}
        title="No orders match"
        message="Try a different search or clear the filters."
        action={
          <button type="button" className={adminBtn.secondary} onClick={clearFilters}>
            Clear filters
          </button>
        }
      />
    );
  } else if (orders.length === 0) {
    content = (
      <InlineState
        icon={<Package className="h-6 w-6" />}
        title={
          statusFilter === "ALL"
            ? "No orders yet"
            : `No ${statusFilter.toLowerCase()} orders`
        }
        message="New orders will show up here as customers check out."
      />
    );
  } else {
    content = (
      <>
        {/* Table on md+ */}
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-cream/60 text-xs font-semibold tracking-wide text-muted uppercase">
              <tr>
                <th scope="col" className="px-5 py-3">Order</th>
                <th scope="col" className="px-3 py-3">Customer</th>
                <th scope="col" className="px-3 py-3">Items</th>
                <th scope="col" className="px-3 py-3">Total</th>
                <th scope="col" className="px-3 py-3">Status</th>
                <th scope="col" className="px-3 py-3">Payment ID</th>
                <th scope="col" className="px-5 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {pageItems.map((order) => {
                const processing = processingOrderId === order.id;
                return (
                  <tr key={order.id} className="hover:bg-cream/50">
                    <td className="px-5 py-3 whitespace-nowrap">
                      <p className="font-semibold text-ink">#{order.id}</p>
                      <p className="text-xs text-muted">
                        {formatLocalDateTime(order.createdAt)}
                      </p>
                    </td>
                    <td className="max-w-[12rem] truncate px-3 py-3 text-ink-soft">
                      {order.userEmail ?? "-"}
                    </td>
                    <td className="max-w-[14rem] truncate px-3 py-3 text-ink-soft">
                      {itemsSummary(order)}
                    </td>
                    <td className="px-3 py-3 font-semibold whitespace-nowrap text-ink">
                      {Number(order.totalAmount).toLocaleString()}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <StatusBadge tone={ORDER_TONES[order.status] ?? "neutral"}>
                          {order.status}
                        </StatusBadge>
                        {order.paymentStatus && (
                          <StatusBadge
                            tone={PAYMENT_TONES[order.paymentStatus] ?? "neutral"}
                          >
                            Pay: {order.paymentStatus.toLowerCase()}
                          </StatusBadge>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <ProofBadge order={order} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {needsReview(order) && (
                          <ReviewButtons
                            order={order}
                            processing={processing}
                            onApprove={approve}
                            onReject={reject}
                          />
                        )}
                        <button
                          type="button"
                          className={adminBtn.icon}
                          onClick={() => setSelectedId(order.id)}
                          aria-label={`View order ${order.id}`}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Cards below md */}
        <ul className="divide-y divide-line-soft md:hidden">
          {pageItems.map((order) => (
            <li key={order.id}>
              <button
                type="button"
                onClick={() => setSelectedId(order.id)}
                className="block w-full p-4 text-left hover:bg-cream/50 focus-visible:outline-2 focus-visible:outline-brand"
                aria-label={`View order ${order.id}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">Order #{order.id}</p>
                    <p className="truncate text-xs text-muted">
                      {order.userEmail ?? "Customer"} ·{" "}
                      {formatLocalDateTime(order.createdAt)}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold text-ink">
                    {Number(order.totalAmount).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-ink-soft">
                  {itemsSummary(order)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge tone={ORDER_TONES[order.status] ?? "neutral"}>
                    {order.status}
                  </StatusBadge>
                  <ProofBadge order={order} />
                </div>
              </button>
            </li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Orders"
        description="Review orders and manage mobile-money transaction IDs."
        actions={
          <div
            role="group"
            aria-label="View"
            className="inline-flex rounded-lg bg-cream-deep p-1"
          >
            {(
              [
                { id: "orders", label: "Orders", icon: ShoppingBag },
                { id: "transactions", label: "Transaction IDs", icon: Hash },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={adminView === id}
                onClick={() => setAdminView(id)}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-brand ${
                  adminView === id
                    ? "bg-white text-ink shadow-sm"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        }
      />

      {adminView === "transactions" && (
        <TransactionManagement
          onStored={() => {
            // New IDs can match pending orders, so refresh the orders table now
            fetchOrders();
            fetchMetrics();
          }}
        />
      )}

      {adminView === "orders" && (
        <>
          <div
            role="tablist"
            aria-label="Order status"
            className="mb-4 flex flex-wrap gap-2"
          >
            {STATUS_TABS.map((tab) => {
              const count = getTabCount(tab.value, metrics);
              const isActive = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => changeStatus(tab.value)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                    isActive
                      ? "border-ink bg-ink text-white"
                      : "border-line-strong bg-white text-ink-soft hover:bg-cream"
                  }`}
                >
                  {tab.label}
                  {count !== undefined && (
                    <span
                      className={`text-xs ${isActive ? "text-white/80" : "text-muted"}`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <AdminCard>
            {!isLoading && !loadFailed && orders.length > 0 && (
              <AdminToolbar
                search={search}
                onSearch={(v) => {
                  setSearch(v);
                  setPage(0);
                }}
                placeholder="Search order #, customer, book or transaction ID"
                label="Search orders"
                hasFilters={hasFilters}
                onClear={clearFilters}
              >
                <select
                  value={proofFilter}
                  onChange={(e) => {
                    setProofFilter(e.target.value);
                    setPage(0);
                  }}
                  aria-label="Filter by payment proof"
                  className={`${adminInput} lg:w-52`}
                >
                  <option value="">Any payment proof</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="AWAITING">Awaiting verification</option>
                  <option value="NONE">No transaction ID</option>
                </select>
              </AdminToolbar>
            )}
            {content}
            {!isLoading && !loadFailed && visible.length > 0 && (
              <Pagination
                page={safePage}
                pageCount={pageCount}
                total={total}
                pageSize={PAGE_SIZE}
                onChange={setPage}
              />
            )}
          </AdminCard>
        </>
      )}

      {selected && (
        <OrderDrawer
          order={selected}
          processing={processingOrderId === selected.id}
          // Esc inside the confirm dialog should only dismiss the dialog
          onClose={() => {
            if (!pending) setSelectedId(null);
          }}
          onApprove={approve}
          onReject={reject}
        />
      )}

      <ConfirmDialog
        open={pending !== null}
        tone={pending?.kind === "reject" ? "danger" : "primary"}
        title={
          pending?.kind === "reject" ? "Reject this order?" : "Approve this order?"
        }
        message={
          pending?.kind === "reject"
            ? `Order #${pending.orderId} will be marked as rejected.`
            : `Order #${pending?.orderId} will be marked as paid and the books added to the customer's library.`
        }
        reasonLabel={pending?.kind === "reject" ? "Reason (optional)" : undefined}
        confirmLabel={pending?.kind === "reject" ? "Reject order" : "Approve order"}
        onConfirm={runAction}
        onCancel={() => setPending(null)}
      />
    </>
  );
}
