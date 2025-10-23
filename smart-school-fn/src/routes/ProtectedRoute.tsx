import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import type { JSX } from "react";

interface ProtectedRouteProps {
    children: JSX.Element;
    allowedRoles?: string[]; // roles that can access this route
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const token = localStorage.getItem("accessToken");

    // 1️⃣ If no token, redirect to login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const decoded: any = jwtDecode(token);
        const userRole = decoded.role;

        // 2️⃣ If route requires specific roles, check them
        if (allowedRoles && !allowedRoles.includes(userRole)) {
            // If user is logged in but not authorized
            if (userRole === "STUDENT" || userRole === "USER") {
                return <Navigate to="/courses" replace />;
            }
            return <Navigate to="/" replace />;
        }

        // 3️⃣ Otherwise, allow access
        return children;
    } catch (err) {
        // Invalid token, remove it and redirect to login
        localStorage.removeItem("accessToken");
        return <Navigate to="/login" replace />;
    }
}
