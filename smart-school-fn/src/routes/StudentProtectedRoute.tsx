import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import type { JSX } from "react";

interface StudentProtectedRouteProps {
  children: JSX.Element;
}

export const StudentProtectedRoute = ({
  children,
}: StudentProtectedRouteProps) => {
  const token = localStorage.getItem("accessToken_student");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded: any = jwtDecode(token);

    if (decoded.actorType !== "STUDENT") {
      return <Navigate to="/login" replace />;
    }

    return children;
  } catch (err) {
    localStorage.removeItem("accessToken_student");
    localStorage.removeItem("student");
    return <Navigate to="/login" replace />;
  }
};
