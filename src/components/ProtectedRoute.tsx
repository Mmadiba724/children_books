import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();
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

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
            </div>
        );
    }

    // If not authenticated, return null (redirect will happen via useEffect)
    if (!isAuthenticated) {
        return null;
    }

    // Render protected content
    return <>{children}</>;
}
