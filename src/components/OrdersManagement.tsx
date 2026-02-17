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
} from "lucide-react";
import toast from "react-hot-toast";
import orderService from "../services/orderService";

interface OrderItem {
    bookId: string | number;
    title?: string;
    author?: string;
    quantity: number;
    price?: number;
    subtotal?: number;
}

interface Order {
    id: string | number;
    userId: string | number;
    userEmail?: string;
    items: OrderItem[];
    status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    paymentStatus?: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
    transactionId?: string | null;
    totalAmount: number;
    currency?: string;
    shippingAddress?: string;
    trackingNumber?: string;
    createdAt: string;
    updatedAt?: string;
    estimatedDelivery?: string;
}

type StatusFilter =
    | "ALL"
    | "PENDING"
    | "CONFIRMED"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";

export default function OrdersManagement() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingOrderId, setProcessingOrderId] = useState<string | null>(
        null,
    );
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

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
    const handleApproveOrder = async (orderId: string | number) => {
        if (
            !globalThis.confirm("Are you sure you want to approve this order?")
        ) {
            return;
        }

        const orderIdStr = String(orderId);
        setProcessingOrderId(orderIdStr);

        try {
            await orderService.approveOrder(orderIdStr);
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
    const handleRejectOrder = async (orderId: string | number) => {
        if (
            !globalThis.confirm("Are you sure you want to reject this order?")
        ) {
            return;
        }

        const orderIdStr = String(orderId);
        setProcessingOrderId(orderIdStr);

        try {
            await orderService.rejectOrder(orderIdStr);
            toast.success("Order rejected successfully");
            fetchOrders();
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
            case "CONFIRMED":
                return "bg-blue-100 text-blue-800";
            case "SHIPPED":
                return "bg-purple-100 text-purple-800";
            case "DELIVERED":
                return "bg-green-100 text-green-800";
            case "CANCELLED":
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
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Orders Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-100">
                    <p className="text-xs text-gray-600 mb-1">Confirmed</p>
                    <p className="text-2xl font-bold text-blue-700">
                        {orders.filter((o) => o.status === "CONFIRMED").length}
                    </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-100">
                    <p className="text-xs text-gray-600 mb-1">Shipped</p>
                    <p className="text-2xl font-bold text-purple-700">
                        {orders.filter((o) => o.status === "SHIPPED").length}
                    </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-100">
                    <p className="text-xs text-gray-600 mb-1">Delivered</p>
                    <p className="text-2xl font-bold text-green-700">
                        {orders.filter((o) => o.status === "DELIVERED").length}
                    </p>
                </div>
            </div>

            {/* Orders List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">
                        {statusFilter === "ALL"
                            ? "No orders found"
                            : `No ${statusFilter.toLowerCase()} orders`}
                    </p>
                </div>
            ) : (
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
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        },
                                                    )}
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
                                                                Shipping
                                                                Address:
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
                                                                Transaction
                                                                Number
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
                                                            ✓ Payment Proof
                                                            Verified
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        {order.items &&
                                            order.items.length > 0 && (
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
                                                    <button
                                                        onClick={() =>
                                                            handleApproveOrder(
                                                                order.id,
                                                            )
                                                        }
                                                        disabled={
                                                            processingOrderId ===
                                                            String(order.id)
                                                        }
                                                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                                    >
                                                        {processingOrderId ===
                                                        String(order.id) ? (
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
                                                                    Approve
                                                                    Order
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
                                                            String(order.id)
                                                        }
                                                        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                                    >
                                                        {processingOrderId ===
                                                        String(order.id) ? (
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
                                                            Review the order
                                                            details carefully
                                                            before taking
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
                                                        {order.status ===
                                                            "CONFIRMED" &&
                                                            "Order has been confirmed"}
                                                        {order.status ===
                                                            "SHIPPED" &&
                                                            "Order is on its way"}
                                                        {order.status ===
                                                            "DELIVERED" &&
                                                            "Order has been delivered"}
                                                        {order.status ===
                                                            "CANCELLED" &&
                                                            "Order was cancelled"}
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
            )}
        </div>
    );
}
