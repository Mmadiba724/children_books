import { useState } from "react";
import CategoryManagement from "../components/CategoryManagement";
import BookManagement from "../components/BookManagement";
import OrdersManagement from "../components/OrdersManagement";
import UserManagement from "../components/UserManagement";
import {  GaugeCircle } from "lucide-react";

type TabType = "categories" | "books" | "orders" | "users";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<TabType>("orders");

    return (
        <div className="min-h-screen bg-rose-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex flex-col items-center justify-center gap-2 w-full">
                    <div className="flex items-center gap-3 mb-2">
                        <GaugeCircle className="w-8 h-8 text-rose-600" />
                        <h1 className="text-3xl font-bold text-gray-900">
                            Admin Dashboard
                        </h1>
                    </div>
                    <p className="text-gray-600">
                        Manage your bookstore's categories, books, orders, and
                        users
                    </p>
                </div>

                {/* Tabs Navigation */}
                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="border-b border-gray-200">
                        <div className="flex flex-wrap -mb-px">
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
                                onClick={() => setActiveTab("users")}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === "users"
                                        ? "border-rose-600 text-rose-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                Users
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    {activeTab === "categories" && <CategoryManagement />}
                    {activeTab === "books" && <BookManagement />}
                    {activeTab === "orders" && <OrdersManagement />}
                    {activeTab === "users" && <UserManagement />}
                </div>
            </div>
        </div>
    );
}
