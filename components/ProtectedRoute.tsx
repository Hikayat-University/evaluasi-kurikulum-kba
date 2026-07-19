import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { C } from "../data";

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: Array<"management" | "guru">;
}) {
  const { session, role, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-sm"
        style={{ background: C.mist, color: C.muted }}
      >
        Memuat…
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/sheet" replace />;
  }

  return <>{children}</>;
}
