import { useState } from "react";
import CategoryManagement from "../components/CategoryManagement";
import BookManagement from "../components/BookManagement";
import OrdersManagement from "../components/OrdersManagement";

type TabType = "categories" | "books" | "orders";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<TabType>("categories");

    return (
        <div className="min-h-screen bg-rose-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Manage your bookstore's categories, books, and orders
                    </p>
                </div>

                {/* Tabs Navigation */}
                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="border-b border-gray-200">
                        <div className="flex flex-wrap -mb-px">
                            <button
                                onClick={() => setActiveTab("categories")}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === "categories"
                                        ? "border-rose-600 text-rose-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                Categories
                            </button>
                            <button
                                onClick={() => setActiveTab("books")}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === "books"
                                        ? "border-rose-600 text-rose-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                Books
                            </button>
                            <button
                                onClick={() => setActiveTab("orders")}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === "orders"
                                        ? "border-rose-600 text-rose-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                Orders
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    {activeTab === "categories" && <CategoryManagement />}
                    {activeTab === "books" && <BookManagement />}
                    {activeTab === "orders" && <OrdersManagement />}
                </div>
            </div>
        </div>
    );
}
