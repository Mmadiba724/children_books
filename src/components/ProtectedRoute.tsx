import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** When set, signed-in users without this role are sent home. */
  requireRole?: "ADMIN";
}

export default function ProtectedRoute({
  children,
  requireRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const pageName = location.pathname.includes("admin")
        ? "admin panel"
        : location.pathname.includes("library")
          ? "your library"
          : "this page";

      toast.error(`Please sign in to access ${pageName}`);
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  const roleDenied =
    !isLoading && isAuthenticated && !!requireRole && user?.role !== requireRole;

  useEffect(() => {
    if (roleDenied) {
      toast.error("You don't have permission to view that page");
      navigate("/", { replace: true });
    }
  }, [roleDenied, navigate]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  // If not authenticated, return null (redirect will happen via useEffect)
  if (!isAuthenticated || roleDenied) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}
