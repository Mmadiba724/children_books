import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import orderService from "../services/orderService";
import authService from "../services/authService";
import { cartSessionManager } from "../config/api";
import { CheckCircle, Edit } from "lucide-react";
import { getImageUrl } from "../utils/imageUtils";

export default function CheckoutPage() {
  const { state, subtotalCents, clear } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [transactionNumber, setTransactionNumber] = useState("");
  const [shippingLocation, setShippingLocation] = useState<
    "kampala" | "outside" | ""
  >("kampala");

  // Check if cart contains any physical books
  const hasPhysicalBooks = state.items.some(
    (item) => item.book.format === "PHYSICAL",
  );

  const subtotal = subtotalCents();
  const shippingCents = hasPhysicalBooks
    ? shippingLocation === "kampala"
      ? 1000000 // 10,000 UGX in cents
      : 0 // negotiated — excluded from order total
    : 0;
  const shippingNegotiated = hasPhysicalBooks && shippingLocation === "outside";
  const total = subtotal + shippingCents;

  // Get user email from auth context
  const userEmail = user?.email || "guest@example.com";

  useEffect(() => {
    // Check authentication
    if (!authService.isAuthenticated()) {
      toast.error("Please sign in to checkout");
      nav("/");
      return;
    }

    // Check if cart is empty
    if (state.items.length === 0) {
      // toast.error("Your cart is empty");
      nav("/cart");
    }
  }, [nav, state.items.length]);

  const handleSubmitOrder = async () => {
    setLoading(true);

    try {
      // Create order payload matching new API format
      // Note: totalAmount should be the subtotal (sum of item prices) without tax/shipping
      // The server will validate this against the calculated total from book prices
      const orderPayload = {
        items: state.items.map((item) => ({
          bookId: Number(item.book.id),
          quantity: item.quantity,
        })),
        totalAmount: (subtotal + shippingCents) / 100, // subtotal + shipping (converted from cents to dollars)
        transactionId: transactionNumber.trim(),
        shippingAddress:
          shippingAddress.trim() || "No shipping address provided",
      };

      console.log("Order payload being sent:", orderPayload);

      // Create order in backend
      const orderResponse = await orderService.createOrder(orderPayload);
      console.log("[Checkout] ✅ Order created:", orderResponse.data.id);

      // Clear cart after successful order creation
      await clear();

      // Clear cart session ID after successful checkout
      console.log("[Checkout] Clearing cart session after successful order");
      cartSessionManager.clearSessionId();
      console.log(
        "[Checkout] ✅ Cart session cleared - ready for new shopping session",
      );

      // Show success message
      toast.success(
        `Order #${orderResponse.data.id} created successfully! ${hasPhysicalBooks ? "Awaiting approval." : "Digital items will be available after approval."}`,
      );

      // Navigate to home or order confirmation
      nav("/?orderCreated=true");
    } catch (error) {
      console.error("Failed to create order:", error);
      toast.error("Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (state.items.length === 0)
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p>Your cart is empty.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Checkout Steps */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="text-green-600" size={24} />
                <h2 className="text-lg font-bold">1. SHIPPING ADDRESS</h2>
              </div>
              {hasPhysicalBooks ? (
                showAddressForm ? (
                  <div>
                    <textarea
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      rows={3}
                      placeholder="Enter your complete shipping address"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-300 resize-none"
                    />
                    <button
                      onClick={() => {
                        if (shippingAddress.trim()) {
                          setShowAddressForm(false);
                          setCurrentStep(2);
                        }
                      }}
                      className="mt-2 text-blue-600 hover:underline text-sm font-semibold"
                    >
                      Save Address
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <p
                        className={
                          shippingAddress
                            ? "text-gray-700"
                            : "text-red-600 font-semibold"
                        }
                      >
                        {shippingAddress || "No address provided"}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="text-blue-600 hover:underline text-sm font-semibold flex items-center gap-1"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                  </div>
                )
              ) : (
                <div>
                  <p className="font-semibold text-gray-900">
                    Electronic delivery
                  </p>
                  <p className="text-blue-600">{userEmail}</p>
                </div>
              )}
            </div>

            {/* Step 2: Shipping Options */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="text-green-600" size={24} />
                <h2 className="text-lg font-bold">2. SHIPPING OPTIONS</h2>
                {currentStep > 2 && (
                  <button className="ml-auto text-blue-600 hover:underline text-sm font-semibold">
                    Edit
                  </button>
                )}
              </div>
              {hasPhysicalBooks ? (
                <div className="space-y-3">
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="shippingLocation"
                        value="kampala"
                        checked={shippingLocation === "kampala"}
                        onChange={() => setShippingLocation("kampala")}
                        className="accent-blue-600"
                      />
                      <span className="font-semibold">Within Kampala</span>
                      <span className="ml-auto font-bold text-gray-900">
                        UGX 10,000
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="shippingLocation"
                        value="outside"
                        checked={shippingLocation === "outside"}
                        onChange={() => setShippingLocation("outside")}
                        className="accent-blue-600"
                      />
                      <span className="font-semibold">Outside Kampala</span>
                      <span className="ml-auto font-bold text-orange-600">
                        Negotiated
                      </span>
                    </label>
                  </div>
                  {shippingLocation === "outside" && (
                    <p className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded p-2">
                      Shipping cost will be confirmed after order submission.
                      You will be contacted with the final amount.
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    Estimated delivery: 5-7 business days
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-semibold">eBook</p>
                  <p className="text-sm text-gray-600">
                    Available Immediately in Your Digital Library (Pre-orders
                    will be available on their release dates.)
                  </p>
                </div>
              )}
            </div>

            {/* Step 3: Payment Details */}
            {/*<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">*/}
            {/*    <div className="flex items-center gap-3 mb-4">*/}
            {/*        <CheckCircle*/}
            {/*            className="text-green-600"*/}
            {/*            size={24}*/}
            {/*        />*/}
            {/*        <h2 className="text-lg font-bold">*/}
            {/*            3. PAYMENT DETAILS*/}
            {/*        </h2>*/}
            {/*        {currentStep > 3 && (*/}
            {/*            <button className="ml-auto text-blue-600 hover:underline text-sm font-semibold">*/}
            {/*                Edit*/}
            {/*            </button>*/}
            {/*        )}*/}
            {/*    </div>*/}
            {/*    <div className="text-gray-700">*/}
            {/*        <p className="text-sm">*/}
            {/*            Payment will be processed upon order*/}
            {/*            approval*/}
            {/*        </p>*/}
            {/*    </div>*/}
            {/*</div>*/}

            {/* Step 4: Review Order */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold mb-4">4. REVIEW ORDER</h2>

              {hasPhysicalBooks ? (
                <p className="text-sm text-gray-600 mb-4">STANDARD SHIPPING</p>
              ) : (
                <p className="text-sm text-blue-600 font-semibold mb-4">
                  DELIVERED ELECTRONICALLY
                </p>
              )}

              <div className="space-y-4">
                {state.items.map((item) => (
                  <div
                    key={item.book.id}
                    className="flex gap-4 pb-4 border-b border-gray-200 last:border-0"
                  >
                    <img
                      src={getImageUrl(item.book.coverImageUrl)}
                      alt={item.book.title}
                      className="w-20 h-28 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.book.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        by {item.book.author}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        {item.book.format}
                      </p>
                      {!hasPhysicalBooks && (
                        <p className="text-xs text-gray-600 mb-2">
                          Available Immediately in Your Digital Library
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        UGX {((item.book.price * 100) / 100).toFixed(0)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                      <p className="font-bold mt-2">
                        UGX{" "}
                        {(
                          (item.book.price * item.quantity * 100) /
                          100
                        ).toFixed(0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    Subtotal ({state.items.length}{" "}
                    {state.items.length === 1 ? "item" : "items"})
                  </span>
                  <span className="font-semibold">
                    UGX {(subtotal / 100).toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Shipping</span>
                  <span
                    className={`font-semibold ${
                      shippingNegotiated
                        ? "text-orange-600"
                        : shippingCents === 0
                          ? "text-green-600"
                          : "text-gray-900"
                    }`}
                  >
                    {shippingNegotiated
                      ? "Negotiated"
                      : shippingCents === 0
                        ? "Free"
                        : `UGX ${(shippingCents / 100).toFixed(0)}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold">Order Total:</span>
                <span className="text-lg font-bold">
                  {shippingNegotiated
                    ? `UGX ${(subtotal / 100).toFixed(0)} + shipping`
                    : `UGX ${(total / 100).toFixed(0)}`}
                </span>
              </div>

              {/* Mobile Money Payment Instructions */}
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-bold text-sm text-gray-900 mb-2">
                  Mobile Money Payment
                </h3>
                <p className="text-xs text-gray-700 mb-2">
                  Please send UGX{" "}
                  {shippingNegotiated
                    ? `${(subtotal / 100).toFixed(0)} (+ negotiated shipping)`
                    : (total / 100).toFixed(0)}{" "}
                  by dialing *185# and follow the prompts to pay to:
                </p>
                <div className="text-sm font-semibold text-gray-900 mb-1">
                  MTN: 0772 123 456
                </div>
                <div>OR</div>
                <div className="text-sm font-semibold text-gray-900 mb-3">
                  Airtel: 0752 123 456
                </div>
                <p className="text-xs text-gray-600">
                  After completing the payment, enter your transaction number
                  below.
                </p>
              </div>

              {/* Transaction Number Input */}
              <div className="mb-4">
                <label
                  htmlFor="transactionNumber"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Transaction Number *
                </label>
                <input
                  id="transactionNumber"
                  type="text"
                  value={transactionNumber}
                  onChange={(e) => setTransactionNumber(e.target.value)}
                  placeholder="Enter mobile money transaction number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                  required
                />
              </div>

              <button
                onClick={handleSubmitOrder}
                disabled={
                  loading ||
                  (hasPhysicalBooks && !shippingAddress) ||
                  (hasPhysicalBooks && !shippingLocation) ||
                  !transactionNumber.trim()
                }
                className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white font-bold py-3 rounded transition-colors mb-4"
              >
                {loading ? "Processing..." : "Submit Order"}
              </button>

              <p className="text-xs text-gray-600 text-center">
                This site is protected by reCAPTCHA and the Google{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a
                  href="https://policies.google.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Terms of Service
                </a>{" "}
                apply.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
