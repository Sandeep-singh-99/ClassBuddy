import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { fetchTeacherGroupStatus } from "@/redux/slice/tSlice";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

interface RoleProtectedRouteProps {
  allowedRoles: string[];
  requireGroup?: boolean;
  children: ReactNode;
}

export default function RoleProtectedRoute({
  allowedRoles,
  requireGroup = false,
  children,
}: RoleProtectedRouteProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { hasGroup } = useAppSelector((state) => state.teachers);
  const toastedRef = useRef(false);

  useEffect(() => {
    if (user && user.role === "teacher" && hasGroup === null) {
      dispatch(fetchTeacherGroupStatus());
    }
  }, [user, hasGroup, dispatch]);

  if (!user) {
    toast.info("You must be logged in to access this page");
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    toast.info("You do not have permission to access this page");
    return <Navigate to="/" replace />;
  }

  if (requireGroup && user.role === "teacher" && hasGroup === false) {
    if (!toastedRef.current) {
      toastedRef.current = true;
      toast.error("Please create a group first to access this feature.");
    }
    return <Navigate to="/t-dashboard/home" replace />;
  }

  return children;
}

