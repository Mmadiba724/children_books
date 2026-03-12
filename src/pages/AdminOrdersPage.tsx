import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2, Package, Clock } from "lucide-react";
import toast from "react-hot-toast";
import orderService, { type Order } from "../services/orderService";
import authService from "../services/authService";
import { formatLocalDateTime } from "../utils/dateUtils";

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingOrderId, setProcessingOrderId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      toast.error("Please sign in to access admin panel");
      globalThis.location.href = "/";
      return;
    }

    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const orders = await orderService.getPendingOrders();
      setOrders(orders);
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrder = async (orderId: number) => {
    setProcessingOrderId(orderId);
    try {
      await orderService.approveOrder(orderId);
      toast.success("Order approved successfully");
      await loadOrders(); // Refresh the list
    } catch (error) {
      console.error("Failed to approve order:", error);
      toast.error("Failed to approve order");
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleRejectOrder = async (orderId: number) => {
    setProcessingOrderId(orderId);
    try {
      await orderService.rejectOrder(orderId);
      toast.success("Order rejected successfully");
      await loadOrders(); // Refresh the list
    } catch (error) {
      console.error("Failed to reject order:", error);
      toast.error("Failed to reject order");
    } finally {
      setProcessingOrderId(null);
    }
  };

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

  const getPaymentStatusColor = (status: string) => {
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
          <p className="ml-3 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 ">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Pending Orders
        </h1>
        <p className="text-gray-600">
          Review and approve or reject pending customer orders
        </p>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No pending orders</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
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
                        {order.paymentStatus}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    {order.userEmail && (
                      <div className="md:col-span-2">
                        <span className="font-medium">Customer:</span>{" "}
                        {order.userEmail}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Total:</span> UGX{" "}
                      {order.totalAmount.toFixed()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatLocalDateTime(order.createdAt)}</span>
                    </div>
                    {order.items && order.items.length > 0 && (
                      <div className="md:col-span-2">
                        <span className="font-medium">Items:</span>
                        <ul className="mt-1 ml-4 list-disc">
                          {order.items.map((item) => (
                            <li key={item.bookId}>
                              {item.title || `Book #${item.bookId}`}
                              {item.author && ` by ${item.author}`} x{" "}
                              {item.quantity}
                              {item.price && ` - UGX ${item.price.toFixed(0)}`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {order.shippingAddress && (
                      <div className="md:col-span-2">
                        <span className="font-medium">Shipping:</span>{" "}
                        {order.shippingAddress}
                      </div>
                    )}
                    {order.trackingNumber && (
                      <div>
                        <span className="font-medium">Tracking:</span>{" "}
                        {order.trackingNumber}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <button
                    onClick={() => handleApproveOrder(order.id)}
                    disabled={processingOrderId === order.id}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition-colors"
                  >
                    {processingOrderId === order.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Approve Order
                  </button>

                  <button
                    onClick={() => handleRejectOrder(order.id)}
                    disabled={processingOrderId === order.id}
                    className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition-colors"
                  >
                    {processingOrderId === order.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Reject Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
