import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type AuthRole } from "./auth";

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: JSX.Element;
  allowedRoles?: AuthRole[];
}) {
  const { isAuthenticated, session } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !session) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
