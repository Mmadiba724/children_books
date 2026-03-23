import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import toast from "react-hot-toast";
import paymentService, {
  type TransactionMatchRecord,
} from "../services/paymentService";
import { formatLocalDateTime } from "../utils/dateUtils";

type ViewMode = "list" | "add-single" | "add-bulk";

export default function TransactionManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [records, setRecords] = useState<TransactionMatchRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Single add form
  const [singleId, setSingleId] = useState("");

  // Bulk add form
  const [bulkText, setBulkText] = useState("");

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

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Transaction IDs</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Store mobile-money transaction IDs so orders are auto-matched at
            checkout
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMatches}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border-2 border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
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
            className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
              viewMode === "add-single"
                ? "bg-rose-100 text-rose-700 border-2 border-rose-300"
                : "bg-rose-600 hover:bg-rose-700 text-white border-2 border-rose-600"
            }`}
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
            className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
              viewMode === "add-bulk"
                ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                : "bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600"
            }`}
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
        <div className="bg-white rounded-lg border-2 border-gray-100 p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Total Stored</p>
          <p className="text-2xl font-bold text-gray-800">{records.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg border-2 border-green-100 p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Matched</p>
          <p className="text-2xl font-bold text-green-700">{matchedCount}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg border-2 border-yellow-100 p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Unmatched</p>
          <p className="text-2xl font-bold text-yellow-700">{unmatchedCount}</p>
        </div>
      </div>

      {/* Add Single Form */}
      {viewMode === "add-single" && (
        <div className="bg-white rounded-xl border-2 border-rose-200 p-6 shadow-sm">
          <h4 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Plus className="w-5 h-5 text-rose-600" />
            Add Single Transaction ID
          </h4>
          <p className="text-sm text-gray-500 mb-5">
            Enter a mobile money transaction ID. When a customer places an order
            with this ID it will be auto-matched.
          </p>

          <form onSubmit={handleSingleSubmit} className="flex gap-3">
            <div className="flex-1">
              <label
                htmlFor="single-tid"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Transaction ID
              </label>
              <input
                id="single-tid"
                type="text"
                value={singleId}
                onChange={(e) => setSingleId(e.target.value)}
                placeholder="e.g. TXN123456789"
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-rose-500 focus:outline-none font-mono text-sm"
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                className="px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Bulk Form */}
      {viewMode === "add-bulk" && (
        <div className="bg-white rounded-xl border-2 border-blue-200 p-6 shadow-sm">
          <h4 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
            <List className="w-5 h-5 text-blue-600" />
            Add Multiple Transaction IDs
          </h4>
          <p className="text-sm text-gray-500 mb-5">
            Paste or type multiple transaction IDs — one per line, or
            comma/semicolon-separated. Duplicates are skipped automatically.
            Maximum 100 per upload.
          </p>

          <form onSubmit={handleBulkSubmit}>
            <label
              htmlFor="bulk-tids"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Transaction IDs{" "}
              <span className="text-gray-400 font-normal">
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
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm resize-y"
              disabled={isSubmitting}
              required
            />

            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                className="px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Records List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h4 className="font-bold text-gray-800 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-gray-500" />
            Stored Transaction IDs
          </h4>
          {!isLoading && (
            <span className="text-xs text-gray-500">
              {records.length} record{records.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 text-rose-500 animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Hash className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No transaction IDs stored yet</p>
            <p className="text-sm mt-1">
              Use the buttons above to add transaction IDs
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {records.map((rec, idx) => {
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
                          ? "bg-blue-50 border-blue-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div
                        className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-3 ${
                          adminStored ? "text-blue-600" : "text-gray-400"
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Admin Entry
                      </div>
                      {adminStored ? (
                        <>
                          <p className="font-mono text-sm font-bold text-gray-900 break-all">
                            {customerTxnId}
                          </p>
                          <div className="mt-2 space-y-1">
                            {adminDate && (
                              <p className="flex items-center gap-1 text-xs text-blue-500">
                                <Clock className="w-3 h-3" />
                                {formatLocalDateTime(adminDate)}
                              </p>
                            )}
                            {adminLabel && (
                              <p className="flex items-center gap-1 text-xs text-blue-500">
                                <UserCircle className="w-3 h-3" />
                                Stored by: {adminLabel}
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-gray-400 italic">
                          Not yet stored by admin
                        </p>
                      )}
                    </div>

                    {/* ── Customer side ── */}
                    <div
                      className={`border rounded-xl p-4 ${
                        matched
                          ? "bg-green-50 border-green-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div
                        className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-3 ${
                          matched ? "text-green-600" : "text-gray-500"
                        }`}
                      >
                        <UserCircle className="w-3.5 h-3.5" />
                        Customer Order
                      </div>

                      {customerTxnId ? (
                        <>
                          <p className="font-mono text-sm font-bold text-gray-900 break-all">
                            {customerTxnId}
                          </p>
                          <div className="mt-3 space-y-1.5">
                            {orderCreatedAt && (
                              <p className="flex items-center gap-1.5 text-xs text-gray-600">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="font-medium">Submitted:</span>
                                <span>
                                  {formatLocalDateTime(orderCreatedAt)}
                                </span>
                              </p>
                            )}
                            {orderId && (
                              <p className="flex items-center gap-1.5 text-xs text-gray-600">
                                <ShoppingBag className="w-3 h-3 text-gray-400" />
                                <span className="font-medium">Order:</span>
                                <span>#{orderId}</span>
                              </p>
                            )}
                            {email && (
                              <p className="flex items-center gap-1.5 text-xs text-gray-600">
                                <Mail className="w-3 h-3 text-gray-400" />
                                <span className="font-medium">Customer:</span>
                                <span className="truncate">{email}</span>
                              </p>
                            )}
                            {amount !== undefined && (
                              <p className="flex items-center gap-1.5 text-xs text-gray-600">
                                <DollarSign className="w-3 h-3 text-gray-400" />
                                <span className="font-medium">Amount:</span>
                                <span>${amount.toFixed(2)}</span>
                              </p>
                            )}
                            {orderStatus && (
                              <p className="flex items-center gap-1.5 text-xs text-gray-600">
                                <Package className="w-3 h-3 text-gray-400" />
                                <span className="font-medium">
                                  Order status:
                                </span>
                                <span
                                  className={`px-1.5 py-0.5 rounded font-semibold ${
                                    orderStatus === "COMPLETED"
                                      ? "bg-green-100 text-green-700"
                                      : orderStatus === "PENDING"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : orderStatus === "CANCELLED"
                                          ? "bg-red-100 text-red-700"
                                          : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {orderStatus}
                                </span>
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-gray-400 italic mt-1">
                          No order submitted yet
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ── Match status bar ── */}
                  <div
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold ${
                      matched
                        ? "bg-green-100 text-green-700"
                        : conflict
                          ? "bg-orange-50 text-orange-700 border border-orange-200"
                          : "bg-yellow-50 text-yellow-700 border border-yellow-200"
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
      </div>
    </div>
  );
}
