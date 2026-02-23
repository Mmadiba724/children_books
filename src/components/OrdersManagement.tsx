import { useState, useEffect } from "react";
import {
    CheckCircle,
    XCircle,
    Loader2,
    Package,
    Clock,
    Filter,
    Mail,
    MapPin,
    CreditCard,
    Hash,
    ShoppingBag,
    DollarSign,
    Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import orderService, { type Order } from "../services/orderService";
import paymentService from "../services/paymentService";

type StatusFilter = "ALL" | "PENDING" | "PAID" | "REJECTED";

export default function OrdersManagement() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingOrderId, setProcessingOrderId] = useState<number | null>(
        null,
    );
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
    const [showTransactionForm, setShowTransactionForm] = useState(false);
    const [transactionId, setTransactionId] = useState("");
    const [isSubmittingTransaction, setIsSubmittingTransaction] = useState(false);

    // Fetch orders
    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            // Currently only getPendingOrders is available
            // In a full implementation, we'd have a getAdminOrders(status?) endpoint
            const data = await orderService.getPendingOrders();
            setOrders(data);
            setFilteredOrders(data);
        } catch (error) {
            toast.error("Failed to load orders");
            console.error("Error fetching orders:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Filter orders when status filter changes
    useEffect(() => {
        if (statusFilter === "ALL") {
            setFilteredOrders(orders);
        } else {
            setFilteredOrders(
                orders.filter((order) => order.status === statusFilter),
            );
        }
    }, [statusFilter, orders]);

    // Handle approve order
    const handleApproveOrder = async (orderId: number) => {
        if (
            !globalThis.confirm("Are you sure you want to approve this order?")
        ) {
            return;
        }

        setProcessingOrderId(orderId);

        try {
            await orderService.approveOrder(orderId);
            toast.success("Order approved successfully");
            fetchOrders();
        } catch (error) {
            toast.error("Failed to approve order");
            console.error("Error approving order:", error);
        } finally {
            setProcessingOrderId(null);
        }
    };

    // Handle reject order
    const handleRejectOrder = async (orderId: number) => {
        if (
            !globalThis.confirm("Are you sure you want to reject this order?")
        ) {
            return;
        }

        setProcessingOrderId(orderId);

        try {
            await orderService.rejectOrder(orderId);
            toast.success("Order rejected successfully");
            fetchOrders();
        } catch (error) {
            toast.error("Failed to reject order");
            console.error("Error rejecting order:", error);
        } finally {
            setProcessingOrderId(null);
        }
    };

    // Handle add transaction ID
    const handleAddTransactionId = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!transactionId.trim()) {
            toast.error("Please enter a transaction ID");
            return;
        }

        setIsSubmittingTransaction(true);

        try {
            const response = await paymentService.addTransactionId({
                transactionId: transactionId.trim(),
            });

            if (response.success) {
                toast.success(response.message || "Transaction ID added successfully! It will be auto-matched with orders.");
                setTransactionId("");
                setShowTransactionForm(false);
                // Refresh orders to see if any got matched
                fetchOrders();
            } else {
                toast.error(response.error || "Failed to add transaction ID");
            }
        } catch (error) {
            toast.error("Failed to add transaction ID");
            console.error("Error adding transaction ID:", error);
        } finally {
            setIsSubmittingTransaction(false);
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

        if (filteredOrders.length === 0) {
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
                {filteredOrders.map((order) => (
                    <div
                        key={order.id}
                        className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-200"
                    >
                        {/* Header Section */}
                        <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-6 py-4 border-b border-gray-200">
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
                                            <span>
                                                {new Date(
                                                    order.createdAt,
                                                ).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
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
                                                    <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-600 block">
                                                            Shipping Address:
                                                        </span>
                                                        <span className="text-sm text-gray-900">
                                                            {
                                                                order.shippingAddress
                                                            }
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
                                                    $
                                                    {order.totalAmount.toFixed(
                                                        2,
                                                    )}
                                                </span>
                                            </div>
                                            {order.transactionId && (
                                                <div className="pt-3 border-t-2 border-green-200 bg-white rounded-lg p-3 shadow-sm">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="bg-green-100 p-1.5 rounded">
                                                            <Hash className="w-4 h-4 text-green-700" />
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-900">
                                                            Mobile Money
                                                            Transaction Number
                                                        </span>
                                                    </div>
                                                    <div className="bg-green-50 px-3 py-2 rounded border-2 border-green-200">
                                                        <span className="text-base font-mono font-bold text-green-900 block text-center">
                                                            {
                                                                order.transactionId
                                                            }
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
                                                Order Items (
                                                {order.items.length})
                                            </h4>
                                            <div className="space-y-3">
                                                {order.items.map(
                                                    (item, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="bg-white rounded-md p-3 flex items-start justify-between gap-3 border border-purple-100"
                                                        >
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-gray-900">
                                                                    {item.title ||
                                                                        `Book #${item.bookId}`}
                                                                </p>
                                                                {item.author && (
                                                                    <p className="text-sm text-gray-600 mt-0.5">
                                                                        by{" "}
                                                                        {
                                                                            item.author
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="text-right flex-shrink-0">
                                                                <p className="text-sm text-gray-600">
                                                                    Qty:{" "}
                                                                    <span className="font-semibold text-gray-900">
                                                                        {
                                                                            item.quantity
                                                                        }
                                                                    </span>
                                                                </p>
                                                                {item.price && (
                                                                    <p className="font-bold text-gray-900 mt-1">
                                                                        $
                                                                        {item.price.toFixed(
                                                                            2,
                                                                        )}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
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
                                                        Transaction ID must be added before approving this order.
                                                    </p>
                                                </div>
                                            ) : null}
                                            <button
                                                onClick={() =>
                                                    handleApproveOrder(
                                                        order.id,
                                                    )
                                                }
                                                disabled={
                                                    processingOrderId ===
                                                        order.id ||
                                                    !order.transactionId
                                                }
                                                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
                                                title={
                                                    !order.transactionId
                                                        ? "Transaction ID must be added first"
                                                        : "Approve this order"
                                                }
                                            >
                                                {processingOrderId ===
                                                order.id ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        <span>
                                                            Processing...
                                                        </span>
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
                                                onClick={() =>
                                                    handleRejectOrder(
                                                        order.id,
                                                    )
                                                }
                                                disabled={
                                                    processingOrderId ===
                                                    order.id
                                                }
                                                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                            >
                                                {processingOrderId ===
                                                order.id ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        <span>
                                                            Processing...
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="w-5 h-5" />
                                                        <span>
                                                            Reject Order
                                                        </span>
                                                    </>
                                                )}
                                            </button>

                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <p className="text-xs text-gray-600 text-center leading-relaxed">
                                                    Review the order details
                                                    carefully before taking
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
                                                        "Payment confirmed"}
                                                    {order.status ===
                                                        "REJECTED" &&
                                                        "Order was rejected"}
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
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Manage Orders
                    </h2>
                    <p className="text-sm text-gray-600">
                        Review and process customer orders
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Add Transaction ID Button */}
                    <button
                        onClick={() => setShowTransactionForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Transaction ID
                    </button>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-600" />
                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value as StatusFilter)
                            }
                            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-rose-500 focus:outline-none"
                        >
                            <option value="ALL">All Orders</option>
                            <option value="PENDING">Pending</option>
                            <option value="PAID">Paid</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Transaction ID Form Modal */}
            {showTransactionForm && (
                <div className="fixed inset-0 bg-transparent backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            Add Transaction ID
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Enter a mobile money transaction ID. It will be automatically matched with orders that have the same transaction ID.
                        </p>

                        <form onSubmit={handleAddTransactionId}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Transaction ID
                                </label>
                                <input
                                    type="text"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder="Enter transaction ID"
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                                    disabled={isSubmittingTransaction}
                                    required
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={isSubmittingTransaction}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmittingTransaction ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        "Add Transaction ID"
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowTransactionForm(false);
                                        setTransactionId("");
                                    }}
                                    disabled={isSubmittingTransaction}
                                    className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Orders Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-100">
                    <p className="text-xs text-gray-600 mb-1">Total</p>
                    <p className="text-2xl font-bold text-gray-800">
                        {orders.length}
                    </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-100">
                    <p className="text-xs text-gray-600 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-yellow-700">
                        {orders.filter((o) => o.status === "PENDING").length}
                    </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-100">
                    <p className="text-xs text-gray-600 mb-1">Paid</p>
                    <p className="text-2xl font-bold text-green-700">
                        {orders.filter((o) => o.status === "PAID").length}
                    </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border-2 border-red-100">
                    <p className="text-xs text-gray-600 mb-1">Rejected</p>
                    <p className="text-2xl font-bold text-red-700">
                        {orders.filter((o) => o.status === "REJECTED").length}
                    </p>
                </div>
            </div>

            {/* Orders List */}
            {renderOrdersContent()}
        </div>
    );
}
