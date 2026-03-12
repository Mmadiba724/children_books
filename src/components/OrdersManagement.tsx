import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Package,
  Clock,
  Mail,
  MapPin,
  CreditCard,
  Hash,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  Ban,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import orderService, {
  type Order,
  type AdminOrderMetrics,
} from "../services/orderService";
import { formatLocalDateTime } from "../utils/dateUtils";
import TransactionManagement from "./TransactionManagement";

type AdminView = "orders" | "transactions";

type StatusFilter =
  | "ALL"
  | "PENDING"
  | "PAID"
  | "REJECTED"
  | "FAILED"
  | "CANCELLED";

const STATUS_TABS: {
  value: StatusFilter;
  label: string;
  activeClass: string;
  dotClass: string;
}[] = [
  {
    value: "ALL",
    label: "All Orders",
    activeClass: "bg-gray-800 text-white border-gray-800",
    dotClass: "bg-gray-400",
  },
  {
    value: "PENDING",
    label: "Pending",
    activeClass: "bg-yellow-500 text-white border-yellow-500",
    dotClass: "bg-yellow-400",
  },
  {
    value: "PAID",
    label: "Paid",
    activeClass: "bg-green-600 text-white border-green-600",
    dotClass: "bg-green-500",
  },
  {
    value: "REJECTED",
    label: "Rejected",
    activeClass: "bg-red-600 text-white border-red-600",
    dotClass: "bg-red-500",
  },
  {
    value: "FAILED",
    label: "Failed",
    activeClass: "bg-orange-500 text-white border-orange-500",
    dotClass: "bg-orange-400",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
    activeClass: "bg-gray-500 text-white border-gray-500",
    dotClass: "bg-gray-400",
  },
];

const getTabCount = (
  tab: StatusFilter,
  metrics: AdminOrderMetrics | null,
): number | undefined => {
  if (!metrics) return undefined;
  switch (tab) {
    case "ALL":
      return metrics.totalOrders;
    case "PENDING":
      return metrics.pendingOrders;
    case "PAID":
      return metrics.paidOrders;
    case "REJECTED":
      return metrics.rejectedOrders;
    case "FAILED":
      return metrics.failedOrders;
    case "CANCELLED":
      return metrics.cancelledOrders;
  }
};

export default function OrdersManagement() {
  const [adminView, setAdminView] = useState<AdminView>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState<AdminOrderMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingOrderId, setProcessingOrderId] = useState<number | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("PENDING");

  // Fetch orders for the current status tab
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await orderService.getAllAdminOrders(
        statusFilter === "ALL" ? undefined : statusFilter,
      );
      setOrders(data);
    } catch (error) {
      toast.error("Failed to load orders");
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch metrics summary for tab counts
  const fetchMetrics = async () => {
    try {
      const data = await orderService.getSummaryMetrics();
      setMetrics(data);
    } catch (error) {
      // Non-critical — tab counts just won't show
      console.error("Error fetching order metrics:", error);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  // Handle approve order
  const handleApproveOrder = async (orderId: number) => {
    if (!globalThis.confirm("Are you sure you want to approve this order?")) {
      return;
    }

    setProcessingOrderId(orderId);

    try {
      await orderService.approveOrder(orderId);
      toast.success("Order approved successfully");
      fetchOrders();
      fetchMetrics();
    } catch (error) {
      toast.error("Failed to approve order");
      console.error("Error approving order:", error);
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Handle reject order
  const handleRejectOrder = async (orderId: number) => {
    const reason = globalThis.prompt("Reason for rejection (optional):", "");
    if (reason === null) return; // user cancelled the prompt

    if (!globalThis.confirm("Are you sure you want to reject this order?")) {
      return;
    }

    setProcessingOrderId(orderId);

    try {
      await orderService.rejectOrder(orderId, reason.trim() || undefined);
      toast.success("Order rejected successfully");
      fetchOrders();
      fetchMetrics();
    } catch (error) {
      toast.error("Failed to reject order");
      console.error("Error rejecting order:", error);
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PAID":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "FAILED":
        return "bg-orange-100 text-orange-800";
      case "CANCELLED":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get payment status badge color
  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Render orders content based on loading and filtered state
  const renderOrdersContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">
            {statusFilter === "ALL"
              ? "No orders found"
              : `No ${statusFilter.toLowerCase()} orders`}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl shadow-lg  border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-200"
          >
            {/* Header Section */}
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-6 py-4 border-b  border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <ShoppingBag className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Order #{order.id}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatLocalDateTime(order.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(order.status)}`}
                  >
                    {order.status}
                  </span>
                  {order.paymentStatus && (
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${getPaymentStatusColor(order.paymentStatus)}`}
                    >
                      {order.paymentStatus}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Information */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Customer & Shipping Info */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      Customer Information
                    </h4>
                    <div className="space-y-2">
                      {order.userEmail && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600 min-w-[60px]">
                            Email:
                          </span>
                          <span className="text-sm text-gray-900">
                            {order.userEmail}
                          </span>
                        </div>
                      )}
                      {order.shippingAddress && (
                        <div className="flex items-start gap-2 pt-2 border-t border-blue-100">
                          <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-sm font-medium text-gray-600 block">
                              Shipping Address:
                            </span>
                            <span className="text-sm text-gray-900">
                              {order.shippingAddress}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-green-600" />
                      Payment Details
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-600">
                            Total Amount:
                          </span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </div>
                      {order.transactionId && (
                        <div className="pt-3 border-t-2 border-green-200 bg-white rounded-lg p-3 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="bg-green-100 p-1.5 rounded">
                              <Hash className="w-4 h-4 text-green-700" />
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                              Mobile Money Transaction Number
                            </span>
                          </div>
                          <div className="bg-green-50 px-3 py-2 rounded border-2 border-green-200">
                            <span className="text-base font-mono font-bold text-green-900 block text-center">
                              {order.transactionId}
                            </span>
                          </div>
                          <p className="text-xs text-green-700 mt-2 text-center font-medium">
                            ✓ Payment Proof Verified
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4 text-purple-600" />
                        Order Items ({order.items.length})
                      </h4>
                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-white rounded-md p-3 flex items-start justify-between gap-3 border border-purple-100"
                          >
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">
                                {item.title || `Book #${item.bookId}`}
                              </p>
                              {item.author && (
                                <p className="text-sm text-gray-600 mt-0.5">
                                  by {item.author}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm text-gray-600">
                                Qty:{" "}
                                <span className="font-semibold text-gray-900">
                                  {item.quantity}
                                </span>
                              </p>
                              {item.price && (
                                <p className="font-bold text-gray-900 mt-1">
                                  ${item.price.toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tracking Information */}
                  {order.trackingNumber && (
                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                      <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Package className="w-4 h-4 text-indigo-600" />
                        Tracking Information
                      </h4>
                      <p className="text-sm font-mono text-gray-900 bg-white px-3 py-2 rounded">
                        {order.trackingNumber}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Section */}
                <div className="lg:col-span-1">
                  {order.status === "PENDING" ? (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 sticky top-4">
                      <h4 className="font-bold text-gray-900 mb-4">
                        Actions Required
                      </h4>
                      <div className="space-y-3">
                        {!order.transactionId ? (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-sm font-medium text-yellow-800 mb-2">
                              ⏳ Waiting for Payment
                            </p>
                            <p className="text-xs text-yellow-700">
                              Transaction ID must be added before approving this
                              order.
                            </p>
                          </div>
                        ) : null}
                        <button
                          onClick={() => handleApproveOrder(order.id)}
                          disabled={
                            processingOrderId === order.id ||
                            !order.transactionId
                          }
                          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
                          title={
                            !order.transactionId
                              ? "Transaction ID must be added first"
                              : "Approve this order"
                          }
                        >
                          {processingOrderId === order.id ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              <span>
                                {!order.transactionId
                                  ? "Waiting for Payment"
                                  : "Approve Order"}
                              </span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleRejectOrder(order.id)}
                          disabled={processingOrderId === order.id}
                          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                          {processingOrderId === order.id ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5" />
                              <span>Reject Order</span>
                            </>
                          )}
                        </button>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs text-gray-600 text-center leading-relaxed">
                            Review the order details carefully before taking
                            action.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="font-bold text-gray-900 mb-3">
                        Order Status
                      </h4>
                      <div className="text-center py-4">
                        <span
                          className={`inline-flex px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}
                        >
                          {order.status}
                        </span>
                        <p className="text-xs text-gray-600 mt-3">
                          {order.status === "PAID" &&
                            "Payment confirmed — books added to library"}
                          {order.status === "REJECTED" && (
                            <>
                              Order was rejected
                              {order.rejectionReason && (
                                <span className="block mt-1 italic text-red-600">
                                  "{order.rejectionReason}"
                                </span>
                              )}
                            </>
                          )}
                          {order.status === "FAILED" && (
                            <span className="flex items-center justify-center gap-1 text-orange-600">
                              <AlertTriangle className="w-3 h-3" />
                              Payment failed
                            </span>
                          )}
                          {order.status === "CANCELLED" && (
                            <span className="flex items-center justify-center gap-1 text-gray-600">
                              <Ban className="w-3 h-3" />
                              Order was cancelled
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Orders & Transactions
          </h2>
          <p className="text-sm text-gray-600">
            Review orders and manage mobile-money transaction IDs
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setAdminView("orders")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              adminView === "orders"
                ? "bg-white shadow text-rose-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Orders
          </button>
          <button
            onClick={() => setAdminView("transactions")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              adminView === "transactions"
                ? "bg-white shadow text-rose-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Hash className="w-4 h-4" />
            Transaction IDs
          </button>
        </div>
      </div>

      {/* Transactions View */}
      {adminView === "transactions" && <TransactionManagement />}

      {/* Orders View */}
      {adminView === "orders" && (
        <>
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
            {STATUS_TABS.map((tab) => {
              const count = getTabCount(tab.value, metrics);
              const isActive = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all duration-150 flex items-center gap-2 ${
                    isActive
                      ? tab.activeClass
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                  {count !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? "bg-white/25 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Orders Stats */}
          {metrics && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              <div className="bg-white p-3 rounded-lg border-2 border-gray-100 text-center">
                <p className="text-xs text-gray-500 mb-1">Total</p>
                <p className="text-xl font-bold text-gray-800">
                  {metrics.totalOrders}
                </p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg border-2 border-yellow-100 text-center">
                <p className="text-xs text-gray-500 mb-1">Pending</p>
                <p className="text-xl font-bold text-yellow-700">
                  {metrics.pendingOrders}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border-2 border-green-100 text-center">
                <p className="text-xs text-gray-500 mb-1">Paid</p>
                <p className="text-xl font-bold text-green-700">
                  {metrics.paidOrders}
                </p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg border-2 border-red-100 text-center">
                <p className="text-xs text-gray-500 mb-1">Rejected</p>
                <p className="text-xl font-bold text-red-700">
                  {metrics.rejectedOrders}
                </p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg border-2 border-orange-100 text-center">
                <p className="text-xs text-gray-500 mb-1">Failed</p>
                <p className="text-xl font-bold text-orange-600">
                  {metrics.failedOrders}
                </p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg border-2 border-gray-200 text-center">
                <p className="text-xs text-gray-500 mb-1">Cancelled</p>
                <p className="text-xl font-bold text-gray-600">
                  {metrics.cancelledOrders}
                </p>
              </div>
            </div>
          )}

          {/* Orders count for current tab */}
          {!isLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <TrendingUp className="w-4 h-4" />
              <span>
                Showing{" "}
                <span className="font-semibold text-gray-800">
                  {orders.length}
                </span>{" "}
                {statusFilter === "ALL"
                  ? "orders"
                  : `${statusFilter.toLowerCase()} order${orders.length !== 1 ? "s" : ""}`}
              </span>
            </div>
          )}

          {/* Orders List */}
          {renderOrdersContent()}
        </>
      )}
    </div>
  );
}
