import { useAppSelector } from "@/hooks/hooks";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

interface RoleProtectedRouteProps {
  allowedRoles: string[];
  children: ReactNode;
}

export default function RoleProtectedRoute({
  allowedRoles,
  children,
}: RoleProtectedRouteProps) {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    toast.error("You must be logged in to access this page");
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    toast.error("You do not have permission to access this page");
    return <Navigate to="/" replace />;
  }
  return children;
}
