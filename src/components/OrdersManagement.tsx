import { useState, useEffect } from "react";
import {
    CheckCircle,
    XCircle,
    Loader2,
    Package,
    Clock,
    Filter,
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
                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-100 hover:border-rose-200 transition-colors"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                {/* Order Info */}
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3 mb-3">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Order #{order.id}
                                        </h3>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}
                                        >
                                            {order.status}
                                        </span>
                                        {order.paymentStatus && (
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}
                                            >
                                                Payment: {order.paymentStatus}
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        {/* Customer Email */}
                                        {order.userEmail && (
                                            <div className="md:col-span-2">
                                                <span className="font-medium text-gray-700">
                                                    Customer:
                                                </span>{" "}
                                                <span className="text-gray-600">
                                                    {order.userEmail}
                                                </span>
                                            </div>
                                        )}

                                        {/* Total Amount */}
                                        <div>
                                            <span className="font-medium text-gray-700">
                                                Total:
                                            </span>{" "}
                                            <span className="text-rose-600 font-semibold">
                                                ${order.totalAmount.toFixed(2)}
                                            </span>
                                        </div>

                                        {/* Date */}
                                        <div className="flex items-center gap-1 text-gray-600">
                                            <Clock className="w-4 h-4" />
                                            <span>
                                                {new Date(
                                                    order.createdAt,
                                                ).toLocaleString()}
                                            </span>
                                        </div>

                                        {/* Items */}
                                        {order.items &&
                                            order.items.length > 0 && (
                                                <div className="md:col-span-2">
                                                    <span className="font-medium text-gray-700">
                                                        Items:
                                                    </span>
                                                    <ul className="mt-1 ml-4 space-y-1">
                                                        {order.items.map(
                                                            (item, idx) => (
                                                                <li
                                                                    key={idx}
                                                                    className="text-gray-600"
                                                                >
                                                                    •{" "}
                                                                    {item.title ||
                                                                        `Book #${item.bookId}`}
                                                                    {item.author && (
                                                                        <span className="text-gray-500">
                                                                            {" "}
                                                                            by{" "}
                                                                            {
                                                                                item.author
                                                                            }
                                                                        </span>
                                                                    )}{" "}
                                                                    <span className="font-medium">
                                                                        x
                                                                        {
                                                                            item.quantity
                                                                        }
                                                                    </span>
                                                                    {item.price && (
                                                                        <span className="text-gray-500">
                                                                            {" "}
                                                                            - $
                                                                            {item.price.toFixed(
                                                                                2,
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                </div>
                                            )}

                                        {/* Shipping Address */}
                                        {order.shippingAddress && (
                                            <div className="md:col-span-2">
                                                <span className="font-medium text-gray-700">
                                                    Shipping:
                                                </span>{" "}
                                                <span className="text-gray-600">
                                                    {order.shippingAddress}
                                                </span>
                                            </div>
                                        )}

                                        {/* Tracking Number */}
                                        {order.trackingNumber && (
                                            <div>
                                                <span className="font-medium text-gray-700">
                                                    Tracking:
                                                </span>{" "}
                                                <span className="text-gray-600">
                                                    {order.trackingNumber}
                                                </span>
                                            </div>
                                        )}

                                        {/* Transaction ID */}
                                        {order.transactionId && (
                                            <div className="md:col-span-2">
                                                <span className="font-medium text-gray-700">
                                                    Transaction:
                                                </span>{" "}
                                                <span className="text-gray-600 font-mono text-xs">
                                                    {order.transactionId}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {order.status === "PENDING" && (
                                    <div className="flex flex-col gap-2 min-w-[180px]">
                                        <button
                                            onClick={() =>
                                                handleApproveOrder(order.id)
                                            }
                                            disabled={
                                                processingOrderId ===
                                                String(order.id)
                                            }
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                                        >
                                            {processingOrderId ===
                                            String(order.id) ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <CheckCircle className="w-4 h-4" />
                                            )}
                                            Approve
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleRejectOrder(order.id)
                                            }
                                            disabled={
                                                processingOrderId ===
                                                String(order.id)
                                            }
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                                        >
                                            {processingOrderId ===
                                            String(order.id) ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <XCircle className="w-4 h-4" />
                                            )}
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
