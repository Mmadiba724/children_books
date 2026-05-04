import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Clock,
  Loader2,
  ChevronRight,
  Filter,
  X,
  ShoppingBag,
} from "lucide-react";
import toast from "react-hot-toast";
import orderService from "../services/orderService";
import bookService from "../services/bookService";
import { getImageUrl } from "../utils/imageUtils";
import type { Book } from "../types/book";
import { formatLocalDateTime } from "../utils/dateUtils";

interface OrderItem {
  id: number;
  bookId: number;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  status: "PENDING" | "PAID" | "REJECTED";
  totalAmount: number;
  paymentId?: string | null;
  transactionId?: string | null;
  verifiedAt?: string | null;
  verifiedBy?: number | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

const MyOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [books, setBooks] = useState<{ [key: number]: Book }>({});
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  // Filter orders based on date range
  const filteredOrders = useMemo(() => {
    if (!startDate && !endDate) {
      return orders;
    }

    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      // Set end date to end of day for inclusive filtering
      if (end) {
        end.setHours(23, 59, 59, 999);
      }

      if (start && end) {
        return orderDate >= start && orderDate <= end;
      } else if (start) {
        return orderDate >= start;
      } else if (end) {
        return orderDate <= end;
      }
      return true;
    });
  }, [orders, startDate, endDate]);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getMyOrders();
      console.log("Orders API response:", response);

      // API returns: { success, data: { content: Order[], pageable, ... }, timestamp }
      let ordersData: Order[] = [];
      if (response && "data" in response) {
        const data = (response as { data: unknown }).data;
        if (data && typeof data === "object" && "content" in data) {
          const content = (data as { content: unknown }).content;
          if (Array.isArray(content)) {
            ordersData = content;
          }
        }
      }

      console.log("Processed orders data:", ordersData);
      setOrders(ordersData);

      // Fetch book details for all books in orders
      const bookIds = new Set<number>();
      ordersData.forEach((order) => {
        order.items?.forEach((item) => {
          bookIds.add(item.bookId);
        });
      });

      const booksData: { [key: number]: Book } = {};
      for (const bookId of bookIds) {
        try {
          const book = await bookService.getBookById(bookId);
          booksData[bookId] = book;
        } catch (error) {
          console.error(`Failed to load book ${bookId}:`, error);
        }
      }
      setBooks(booksData);
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast.error("Failed to load orders");
      setOrders([]); // Ensure orders is always an array
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PAID":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return formatLocalDateTime(dateString);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
          <p className="ml-3 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col items-center justify-center gap-2 w-full">
        <div className="flex items-center gap-3 mb-2">
          <ShoppingBag className="w-8 h-8 text-brand" />
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        </div>
        <p className="text-gray-600">
          View and manage all your orders and purchases
        </p>
      </div>

      {/* Filter Button */}
      {(startDate || endDate) && (
        <div className="mt-3 inline-flex items-center gap-2 bg-brand-light text-brand-dark px-3 py-1.5 rounded-full text-sm font-medium border border-brand-light">
          <Filter className="w-4 h-4" />
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      )}
      <div className="relative lg:min-w-[380px] flex lg:justify-end mb-4 lg:items-center">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-brand transition-all font-medium shadow-sm"
        >
          <Filter className="w-4 h-4" />
          Filter Orders
          {(startDate || endDate) && (
            <span className="ml-1 px-2 py-0.5 bg-brand-light text-brand-dark text-xs font-bold rounded-full">
              {[startDate, endDate].filter(Boolean).length}
            </span>
          )}
        </button>

        {/* Filter Panel - Dropdown */}
        {isFilterOpen && (
          <>
            {/* Backdrop */}
            <button
              type="button"
              className="fixed inset-0 z-40 bg-transparent cursor-default"
              onClick={() => setIsFilterOpen(false)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setIsFilterOpen(false);
                }
              }}
              aria-label="Close filter panel"
            />

            {/* Filter Panel */}
            <div className="absolute right-0 top-full mt-2 z-50 w-full lg:max-w-96 ">
              <div className="bg-linear-to-br from-white to-gray-50 rounded-xl shadow-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-brand-light rounded-lg">
                      <Filter className="w-4 h-4 text-brand" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Filter Orders
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="startDate"
                      className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide"
                    >
                      From Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="endDate"
                      className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide"
                    >
                      To Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white"
                    />
                  </div>

                  {(startDate || endDate) && (
                    <button
                      onClick={() => {
                        clearFilters();
                        setIsFilterOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium text-sm"
                    >
                      <X size={16} />
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Orders List */}
      {!Array.isArray(filteredOrders) || filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          {orders.length === 0 ? (
            <>
              <p className="text-gray-600 text-lg mb-4">
                You haven't placed any orders yet
              </p>
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 bg-brand text-white px-6 py-2 rounded-lg hover:bg-brand-dark transition-colors"
              >
                Browse Books
                <ChevronRight size={16} />
              </Link>
            </>
          ) : (
            <>
              <p className="text-gray-600 text-lg mb-4">
                No orders found for the selected date range
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 bg-brand text-white px-6 py-2 rounded-lg hover:bg-brand-dark transition-colors"
              >
                <X size={16} />
                Clear Filters
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="p-6">
                {/* Order Items */}
                {order.items && order.items.length > 0 && (
                  <div className="mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                      {order.items.map((item) => {
                        const book = books[item.bookId];
                        return (
                          <div
                            key={`${order.id}-${item.bookId}`}
                            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow max-w-xs"
                          >
                            {/* Book Cover */}
                            <div className="relative aspect-[1/1.5] bg-gray-100 flex items-center justify-center w-full">
                              {book && book.coverImageUrl ? (
                                <img
                                  src={getImageUrl(book.coverImageUrl)}
                                  alt={book.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <svg
                                  className="w-8 h-8 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M12 6.253v13m0-13C6.5 6.253 2 10.753 2 16.5S6.5 26.747 12 26.747s10-4.5 10-10.247S17.5 6.253 12 6.253z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 12h6M9 16h6"
                                  />
                                </svg>
                              )}
                            </div>

                            {/* Book Details */}
                            <div className="p-1.5 bg-white">
                              {book ? (
                                <>
                                  <h5 className="font-semibold text-gray-900 text-xs mb-0.5 line-clamp-1">
                                    {book.title}
                                  </h5>
                                  <p className="text-xs text-gray-600 mb-0.5 line-clamp-1">
                                    by {book.author}
                                  </p>
                                  {book.categoryNames &&
                                    book.categoryNames.length > 0 && (
                                      <div className="mb-0.5">
                                        <div className="flex flex-wrap gap-0.5">
                                          {book.categoryNames
                                            .slice(0, 1)
                                            .map((cat) => (
                                              <span
                                                key={cat}
                                                className="inline-block bg-blue-50 text-blue-700 text-xs px-1 py-0.5 rounded"
                                              >
                                                {cat}
                                              </span>
                                            ))}
                                        </div>
                                      </div>
                                    )}
                                </>
                              ) : (
                                <>
                                  <p className="text-xs text-gray-500">
                                    Book #{item.bookId}
                                  </p>
                                </>
                              )}

                              {/* Price and Quantity */}
                              <div className="border-t border-gray-100 pt-0.5 mt-0.5">
                                <div className="flex justify-between items-center mb-0.5 text-xs">
                                  <span className="text-gray-600">Price</span>
                                  <span className="font-semibold text-gray-900 text-xs">
                                    {item.price.toFixed(0)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center mb-0.5 text-xs">
                                  <span className="text-gray-600">Qty</span>
                                  <span className="font-semibold text-gray-900 text-xs">
                                    {item.quantity}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center border-t border-gray-100 pt-0.5">
                                  <span className="text-xs font-medium text-gray-700">
                                    Total
                                  </span>
                                  <span className="text-xs font-bold text-brand">
                                    {(item.price * item.quantity).toFixed(0)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200">
                  <div className="space-y-1 mb-4 sm:mb-0">
                    {order.verifiedAt && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Verified:</span>{" "}
                        {formatDate(order.verifiedAt)}
                      </p>
                    )}
                    {order.rejectionReason && (
                      <p className="text-sm text-red-600">
                        <span className="font-medium">Rejection Reason:</span>{" "}
                        {order.rejectionReason}
                      </p>
                    )}
                    {order.transactionId && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Transaction:</span>{" "}
                        {order.transactionId}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-brand">
                      UGX {order.totalAmount.toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
