import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks";
import type { JSX } from "react";
import type { RootState } from "../../redux/stores";

interface GuardProps {
    children: JSX.Element;
    allowedRoles?: string[];
    redirectPath?: string;
}

/**
 * Unified Guard for Authentication and RBAC.
 * Replaces fragmented ProtectedRoute implementations.
 */
export const AuthGuard = ({
    children,
    allowedRoles,
    redirectPath = "/login"
}: GuardProps) => {
    const { isAuthenticated, user } = useAppSelector((state: RootState) => state.auth);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to={redirectPath} state={{ from: location }} replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role) && user.role !== "SUPER_ADMIN") {
        // Redirect based on role if unauthorized
        if (user.role === "STUDENT" || user.role === "USER") {
            return <Navigate to="/courses" replace />;
        }
        return <Navigate to="/" replace />;
    }

    return children;
};
