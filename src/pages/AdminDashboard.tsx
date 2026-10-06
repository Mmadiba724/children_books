import { useSearchParams } from "react-router-dom";
import AdminLayout from "../components/admin/AdminLayout";
import AdminOverview from "../components/admin/AdminOverview";
import {
  isAdminSection,
  type AdminSection,
} from "../components/admin/sections";
import BookManagement from "../components/BookManagement";
import CategoryManagement from "../components/CategoryManagement";
import OrdersManagement from "../components/OrdersManagement";
import UserManagement from "../components/UserManagement";

/**
 * Admin console. Sections are tab state kept in ?section= so a refresh or the
 * back button lands on the same section while the route stays /admin.
 */
export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get("section");
  const active: AdminSection = isAdminSection(raw) ? raw : "overview";

  const navigate = (section: AdminSection) => {
    setSearchParams(section === "overview" ? {} : { section });
  };

  return (
    <AdminLayout active={active} onNavigate={navigate}>
      {active === "overview" && <AdminOverview onNavigate={navigate} />}
      {active === "orders" && <OrdersManagement />}
      {active === "books" && <BookManagement />}
      {active === "categories" && <CategoryManagement />}
      {active === "users" && <UserManagement />}
    </AdminLayout>
  );
}
