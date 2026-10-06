import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  List,
  Loader2,
  CheckCircle,
  Clock,
  Hash,
  RefreshCw,
  ShoppingBag,
  Mail,
  X,
  ClipboardList,
  ShieldCheck,
  UserCircle,
  ArrowLeftRight,
  DollarSign,
  Package,
  SearchX,
} from "lucide-react";
import toast from "react-hot-toast";
import paymentService, {
  type TransactionMatchRecord,
} from "../services/paymentService";
import { formatLocalDateTime } from "../utils/dateUtils";
import AdminToolbar from "./admin/AdminToolbar";
import { AdminCard, InlineState, Pagination, StatusBadge } from "./admin/ui";
import { adminBtn, adminInput } from "./admin/adminStyles";

type ViewMode = "list" | "add-single" | "add-bulk";

// Records are tall comparison cards, so keep pages short
const PAGE_SIZE = 5;

type TransactionManagementProps = {
  /** Called after IDs are stored, so dependent views (orders) can refresh. */
  readonly onStored?: () => void;
};

export default function TransactionManagement({
  onStored,
}: TransactionManagementProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [records, setRecords] = useState<TransactionMatchRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Single add form
  const [singleId, setSingleId] = useState("");

  // Bulk add form
  const [bulkText, setBulkText] = useState("");

  // List search / filter / pagination
  const [search, setSearch] = useState("");
  const [matchFilter, setMatchFilter] = useState("");
  const [page, setPage] = useState(0);

  const fetchMatches = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await paymentService.getTransactionMatches();
      setRecords(data);
    } catch {
      toast.error("Failed to load transaction IDs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // ── Single submit ────────────────────────────────────────────────────────────
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = singleId.trim();
    if (!id) {
      toast.error("Please enter a transaction ID");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await paymentService.addTransactionId({ transactionId: id });
      if (res.success) {
        toast.success(res.message || "Transaction ID stored successfully");
        setSingleId("");
        setViewMode("list");
        fetchMatches();
        onStored?.();
      } else {
        toast.error(res.error || "Failed to store transaction ID");
      }
    } catch {
      toast.error("Failed to store transaction ID");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Bulk submit ──────────────────────────────────────────────────────────────
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ids = bulkText
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (ids.length === 0) {
      toast.error("Enter at least one transaction ID");
      return;
    }
    if (ids.length > 100) {
      toast.error("Maximum 100 transaction IDs per bulk upload");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await paymentService.addBulkTransactionIds({
        transactionIds: ids,
      });
      if (res.success) {
        toast.success(
          res.message || `${ids.length} transaction ID(s) stored successfully`,
        );
        setBulkText("");
        setViewMode("list");
        fetchMatches();
        onStored?.();
      } else {
        toast.error(res.error || "Failed to store transaction IDs");
      }
    } catch {
      toast.error("Failed to store transaction IDs");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────
  // Both admin and customer have submitted — regardless of backend's flag
  const hasBothSides = (rec: TransactionMatchRecord): boolean => {
    const hasAdmin =
      rec.storedId != null || rec.adminRecord?.transactionId != null;
    const hasOrder = rec.orderId != null || rec.orderRecord?.orderId != null;
    return hasAdmin && hasOrder;
  };

  // True match: both sides present AND backend confirms IDs are equal
  const isMatched = (rec: TransactionMatchRecord): boolean => {
    if (hasBothSides(rec)) {
      // If the backend explicitly says matched, trust it
      if (rec.orderTransactionIdMatched === true) return true;
      // If matched flag is null/undefined and both sides are present, treat as matched
      if (rec.orderTransactionIdMatched == null && rec.matched == null)
        return true;
      if (typeof rec.matched === "boolean") return rec.matched;
    }
    return false;
  };

  // Both sides exist but backend says IDs don't align (conflict indicator)
  const hasConflict = (rec: TransactionMatchRecord): boolean =>
    hasBothSides(rec) && rec.orderTransactionIdMatched === false;

  const getOrderId = (rec: TransactionMatchRecord): number | undefined =>
    rec.orderId ?? rec.orderRecord?.orderId;

  const getUserEmail = (rec: TransactionMatchRecord): string | undefined =>
    rec.userEmail ?? rec.orderRecord?.userEmail;

  const getOrderAmount = (rec: TransactionMatchRecord): number | undefined =>
    rec.orderAmount ?? rec.orderRecord?.totalAmount;

  const matchedCount = records.filter(isMatched).length;
  const unmatchedCount = records.length - matchedCount;

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((rec) => {
      if (matchFilter === "MATCHED" && !isMatched(rec)) return false;
      if (matchFilter === "CONFLICT" && !hasConflict(rec)) return false;
      if (
        matchFilter === "UNMATCHED" &&
        (isMatched(rec) || hasConflict(rec))
      )
        return false;
      if (!q) return true;
      return (
        (rec.transactionId ?? "").toLowerCase().includes(q) ||
        (rec.orderRecord?.transactionId ?? "").toLowerCase().includes(q) ||
        (getUserEmail(rec) ?? "").toLowerCase().includes(q) ||
        String(getOrderId(rec) ?? "").includes(q)
      );
    });
    // helpers above are pure functions of a record
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, search, matchFilter]);

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = visible.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE,
  );
  const hasFilters = Boolean(search || matchFilter);
  const clearFilters = () => {
    setSearch("");
    setMatchFilter("");
    setPage(0);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">
            Transaction IDs
          </h2>
          <p className="text-sm text-ink-soft mt-0.5">
            Store mobile-money transaction IDs so orders are auto-matched at
            checkout.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMatches}
            disabled={isLoading}
            className={adminBtn.secondary}
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button
            onClick={() =>
              setViewMode(viewMode === "add-single" ? "list" : "add-single")
            }
            className={viewMode === "add-single" ? adminBtn.secondary : adminBtn.primary}
          >
            {viewMode === "add-single" ? (
              <X className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Single
          </button>
          <button
            onClick={() =>
              setViewMode(viewMode === "add-bulk" ? "list" : "add-bulk")
            }
            className={viewMode === "add-bulk" ? adminBtn.secondary : adminBtn.primary}
          >
            {viewMode === "add-bulk" ? (
              <X className="w-4 h-4" />
            ) : (
              <List className="w-4 h-4" />
            )}
            Add Bulk
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <AdminCard className="p-4">
          <p className="text-xs font-semibold text-ink-soft mb-1">Total stored</p>
          <p className="font-display text-2xl font-bold text-ink">{records.length}</p>
        </AdminCard>
        <AdminCard className="p-4">
          <p className="text-xs font-semibold text-ink-soft mb-1">Matched</p>
          <p className="font-display text-2xl font-bold text-success">{matchedCount}</p>
        </AdminCard>
        <AdminCard className="p-4">
          <p className="text-xs font-semibold text-ink-soft mb-1">Unmatched</p>
          <p className="font-display text-2xl font-bold text-warning">{unmatchedCount}</p>
        </AdminCard>
      </div>

      {/* Add Single Form */}
      {viewMode === "add-single" && (
        <AdminCard className="p-5 sm:p-6">
          <h3 className="text-base font-bold text-ink mb-1 flex items-center gap-2">
            <Plus className="w-4 h-4 text-brand" />
            Add single transaction ID
          </h3>
          <p className="text-sm text-muted mb-5">
            Enter a mobile money transaction ID. When a customer places an order
            with this ID it will be auto-matched.
          </p>

          <form onSubmit={handleSingleSubmit} className="flex gap-3">
            <div className="flex-1">
              <label
                htmlFor="single-tid"
                className="block text-sm font-medium text-ink-soft mb-1.5"
              >
                Transaction ID
              </label>
              <input
                id="single-tid"
                type="text"
                value={singleId}
                onChange={(e) => setSingleId(e.target.value)}
                placeholder="e.g. TXN123456789"
                className={`${adminInput} font-mono`}
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={adminBtn.primary}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Save
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSingleId("");
                  setViewMode("list");
                }}
                disabled={isSubmitting}
                className={adminBtn.secondary}
              >
                Cancel
              </button>
            </div>
          </form>
        </AdminCard>
      )}

      {/* Add Bulk Form */}
      {viewMode === "add-bulk" && (
        <AdminCard className="p-5 sm:p-6">
          <h3 className="text-base font-bold text-ink mb-1 flex items-center gap-2">
            <List className="w-5 h-5 text-info" />
            Add multiple transaction IDs
          </h3>
          <p className="text-sm text-muted mb-5">
            Paste or type multiple transaction IDs — one per line, or
            comma/semicolon-separated. Duplicates are skipped automatically.
            Maximum 100 per upload.
          </p>

          <form onSubmit={handleBulkSubmit}>
            <label
              htmlFor="bulk-tids"
              className="block text-sm font-medium text-ink-soft mb-1.5"
            >
              Transaction IDs{" "}
              <span className="text-muted font-normal">
                (
                {
                  bulkText
                    .split(/[\n,;]+/)
                    .map((s) => s.trim())
                    .filter(Boolean).length
                }{" "}
                entered)
              </span>
            </label>
            <textarea
              id="bulk-tids"
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={"TXN123456789\nTXN987654321\nTXN111222333"}
              rows={8}
              className={`${adminInput} font-mono resize-y`}
              disabled={isSubmitting}
              required
            />

            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={adminBtn.primary}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Save All
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setBulkText("");
                  setViewMode("list");
                }}
                disabled={isSubmitting}
                className={adminBtn.secondary}
              >
                Cancel
              </button>
            </div>
          </form>
        </AdminCard>
      )}

      {/* Records List */}
      <AdminCard className="overflow-hidden">
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-ink flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-muted" />
            Stored transaction IDs
          </h3>
          {!isLoading && (
            <span className="text-xs text-muted">
              {records.length} record{records.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {!isLoading && records.length > 0 && (
          <AdminToolbar
            search={search}
            onSearch={(v) => {
              setSearch(v);
              setPage(0);
            }}
            placeholder="Search transaction ID, order # or customer"
            label="Search transaction IDs"
            hasFilters={hasFilters}
            onClear={clearFilters}
          >
            <select
              value={matchFilter}
              onChange={(e) => {
                setMatchFilter(e.target.value);
                setPage(0);
              }}
              aria-label="Filter by match status"
              className={`${adminInput} lg:w-48`}
            >
              <option value="">All records</option>
              <option value="MATCHED">Matched</option>
              <option value="UNMATCHED">Unmatched</option>
              <option value="CONFLICT">Conflict</option>
            </select>
          </AdminToolbar>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 text-brand animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <Hash className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No transaction IDs stored yet</p>
            <p className="text-sm mt-1">
              Use the buttons above to add transaction IDs
            </p>
          </div>
        ) : visible.length === 0 ? (
          <InlineState
            icon={<SearchX className="h-6 w-6" />}
            title="No records match"
            message="Try a different search or clear the filters."
            action={
              <button
                type="button"
                className={adminBtn.secondary}
                onClick={clearFilters}
              >
                Clear filters
              </button>
            }
          />
        ) : (
          <div className="divide-y divide-line-soft">
            {pageItems.map((rec, idx) => {
              // Admin side: the pre-stored entry
              const adminStored =
                rec.storedId != null || rec.adminRecord != null;
              const adminDate =
                rec.storedCreatedAt ??
                rec.adminRecord?.createdAt ??
                rec.storedAt ??
                rec.createdAt;
              const adminLabel = rec.storedCreatedBy ?? null;

              // Customer / order side
              const customerTxnId =
                rec.transactionId || rec.orderRecord?.transactionId;
              const matched = isMatched(rec);
              const bothPresent = hasBothSides(rec);
              const conflict = hasConflict(rec);
              const orderId = getOrderId(rec);
              const email = getUserEmail(rec);
              const amount = getOrderAmount(rec);
              const orderStatus = rec.orderStatus ?? rec.orderRecord?.status;
              const orderCreatedAt =
                rec.orderCreatedAt ?? rec.orderRecord?.createdAt;

              return (
                <div
                  key={`${customerTxnId ?? ""}-${idx}`}
                  className="px-5 py-5 space-y-4"
                >
                  {/* Two-column comparison row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* ── Admin side ── */}
                    <div
                      className={`border rounded-xl p-4 ${
                        adminStored
                          ? "bg-sky-light/50 border-sky-light"
                          : "bg-cream border-line"
                      }`}
                    >
                      <div
                        className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-3 ${
                          adminStored ? "text-info" : "text-muted"
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Admin Entry
                      </div>
                      {adminStored ? (
                        <>
                          <p className="font-mono text-sm font-bold text-ink break-all">
                            {customerTxnId}
                          </p>
                          <div className="mt-2 space-y-1">
                            {adminDate && (
                              <p className="flex items-center gap-1 text-xs text-info">
                                <Clock className="w-3 h-3" />
                                {formatLocalDateTime(adminDate)}
                              </p>
                            )}
                            {adminLabel && (
                              <p className="flex items-center gap-1 text-xs text-info">
                                <UserCircle className="w-3 h-3" />
                                Stored by: {adminLabel}
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-muted italic">
                          Not yet stored by admin
                        </p>
                      )}
                    </div>

                    {/* ── Customer side ── */}
                    <div
                      className={`border rounded-xl p-4 ${
                        matched
                          ? "bg-success-light/60 border-success-light"
                          : "bg-cream border-line"
                      }`}
                    >
                      <div
                        className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-3 ${
                          matched ? "text-success" : "text-muted"
                        }`}
                      >
                        <UserCircle className="w-3.5 h-3.5" />
                        Customer Order
                      </div>

                      {customerTxnId ? (
                        <>
                          <p className="font-mono text-sm font-bold text-ink break-all">
                            {customerTxnId}
                          </p>
                          <div className="mt-3 space-y-1.5">
                            {orderCreatedAt && (
                              <p className="flex items-center gap-1.5 text-xs text-ink-soft">
                                <Clock className="w-3 h-3 text-muted" />
                                <span className="font-medium">Submitted:</span>
                                <span>
                                  {formatLocalDateTime(orderCreatedAt)}
                                </span>
                              </p>
                            )}
                            {orderId && (
                              <p className="flex items-center gap-1.5 text-xs text-ink-soft">
                                <ShoppingBag className="w-3 h-3 text-muted" />
                                <span className="font-medium">Order:</span>
                                <span>#{orderId}</span>
                              </p>
                            )}
                            {email && (
                              <p className="flex items-center gap-1.5 text-xs text-ink-soft">
                                <Mail className="w-3 h-3 text-muted" />
                                <span className="font-medium">Customer:</span>
                                <span className="truncate">{email}</span>
                              </p>
                            )}
                            {amount !== undefined && (
                              <p className="flex items-center gap-1.5 text-xs text-ink-soft">
                                <DollarSign className="w-3 h-3 text-muted" />
                                <span className="font-medium">Amount:</span>
                                <span>${amount.toFixed(2)}</span>
                              </p>
                            )}
                            {orderStatus && (
                              <p className="flex items-center gap-1.5 text-xs text-ink-soft">
                                <Package className="w-3 h-3 text-muted" />
                                <span className="font-medium">
                                  Order status:
                                </span>
                                <StatusBadge
                                  tone={
                                    orderStatus === "COMPLETED" ||
                                    orderStatus === "PAID"
                                      ? "success"
                                      : orderStatus === "PENDING"
                                        ? "warning"
                                        : orderStatus === "CANCELLED"
                                          ? "error"
                                          : "info"
                                  }
                                >
                                  {orderStatus}
                                </StatusBadge>
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-muted italic mt-1">
                          No order submitted yet
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ── Match status bar ── */}
                  <div
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold ${
                      matched
                        ? "bg-success-light text-success"
                        : conflict
                          ? "bg-error-light text-error"
                          : "bg-warning-light text-warning"
                    }`}
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    {matched
                      ? "Transaction IDs matched — order confirmed"
                      : conflict
                        ? "Both submitted — IDs do not match"
                        : bothPresent
                          ? "Both submitted — awaiting confirmation"
                          : "Awaiting customer order with this transaction ID"}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && visible.length > 0 && (
          <Pagination
            page={safePage}
            pageCount={pageCount}
            total={visible.length}
            pageSize={PAGE_SIZE}
            onChange={setPage}
          />
        )}
      </AdminCard>
    </div>
  );
}
