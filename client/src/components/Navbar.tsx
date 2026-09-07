import { LayoutDashboard, LogOutIcon } from "lucide-react";
import { Link } from "react-router-dom";
import AuthComponent from "./AuthComponent";
import { useAppSelector } from "@/hooks/hooks";
import { useAppDispatch } from "@/hooks/hooks";
import { logout } from "@/redux/slice/authSlice";
import { useNavigate } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "./mode-toggle";
import UserProfileImage from "./skeletons/userProfileImage";
import { toast } from "sonner";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout()).then(() => {
      toast.success("Logged out successfully");
    });
    navigate("/");
  };

  const { user } = useAppSelector((state) => state.auth);

  return (
    <nav
      aria-label="Main navigation"
      className="fixed top-0 left-0 w-full z-50 bg-slate-50/80 dark:bg-[#0c1729]/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          to={"/"}
          className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500 hover:opacity-80 transition-opacity"
        >
          ClassBuddy
        </Link>

        <div className="flex items-center gap-4">
          <ModeToggle />
          {user ? (
            <div className="flex items-center gap-4 text-foreground">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {user.image_url ? (
                    <img
                      src={user.image_url}
                      alt={user.full_name}
                      className="w-8 h-8 rounded-full object-cover cursor-pointer"
                      loading="lazy"
                    />
                  ) : (
                    <UserProfileImage />
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="" align="end" sideOffset={5}>
                  {user.role === "teacher" ? (
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <Link
                          to={"/t-dashboard/home"}
                          className="transition flex gap-2"
                        >
                          <LayoutDashboard />
                          <p>Dashboard</p>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={handleLogout}
                      >
                        <LogOutIcon />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  ) : (
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <Link
                          to={"/dashboard-panel/home"}
                          className="transition flex gap-2"
                        >
                          <LayoutDashboard />
                          <p>Dashboard</p>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={handleLogout}
                      >
                        <LogOutIcon />
                        <p>Logout</p>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <AuthComponent />
          )}
        </div>
      </div>
    </nav>
  );
}
