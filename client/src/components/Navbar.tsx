import {
  LayoutDashboard,
  LogOutIcon,
  Command,
} from "lucide-react";
import { Link } from "react-router-dom";
import AuthComponent from "./AuthComponent";
import { useAppSelector, useAppDispatch } from "@/hooks/hooks";
import { logout } from "@/redux/slice/authSlice";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "./mode-toggle";
import UserProfileImage from "./skeletons/userProfileImage";
import { toast } from "sonner";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout()).then(() => {
      toast.success("Logged out successfully");
    });
    navigate("/");
  };

  const dashboardPath =
    user?.role === "teacher" ? "/t-dashboard/home" : "/dashboard-panel/home";

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none px-4 pt-3 sm:pt-4">
      <header className="pointer-events-auto max-w-5xl mx-auto rounded-2xl backdrop-blur-xl bg-background/75 dark:bg-card/75 border border-black/[0.08] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-300">
        <nav
          aria-label="Main navigation"
          className="h-14 px-4 sm:px-5 flex items-center justify-between"
        >
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group cursor-pointer"
            aria-label="ClassBuddy Home"
          >
            <div className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center font-bold transition-transform group-hover:scale-105">
              <Command className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-foreground">
                ClassBuddy
              </span>
              <span className="hidden sm:inline-flex items-center text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-black/[0.06] dark:border-white/[0.06]">
                2.4
              </span>
            </div>
          </Link>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <ModeToggle />

            {user ? (
              <div className="flex items-center gap-2">
                <Link to={dashboardPath}>
                  <Button
                    size="sm"
                    className="h-8 px-3 sm:px-3.5 rounded-xl text-xs font-medium bg-foreground text-background hover:bg-foreground/90 transition-all active:scale-[0.98] gap-1.5 shadow-xs"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="rounded-full p-0.5 border border-black/[0.08] dark:border-white/[0.08] hover:border-foreground/30 hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer focus:outline-none"
                      aria-label="Open user menu"
                    >
                      {user.image_url ? (
                        <img
                          src={user.image_url}
                          alt={user.full_name || "User profile"}
                          className="w-7 h-7 rounded-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <UserProfileImage />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={8} className="w-52 p-1.5 rounded-xl shadow-lg border border-black/[0.08] dark:border-white/[0.08]">
                    <DropdownMenuLabel className="font-normal px-2 py-1.5">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold leading-none truncate text-foreground">
                            {user.full_name || "My Account"}
                          </p>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 capitalize shrink-0">
                            {user.role}
                          </span>
                        </div>
                        <p className="text-[11px] leading-none text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        variant="destructive"
                        className="cursor-pointer flex items-center gap-2 text-xs rounded-lg"
                        onClick={handleLogout}
                      >
                        <LogOutIcon className="w-3.5 h-3.5" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <AuthComponent
                  defaultTab="login"
                  trigger={
                    <button
                      type="button"
                      className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      Log in
                    </button>
                  }
                />
                <AuthComponent
                  defaultTab="signup"
                  trigger={
                    <Button
                      size="sm"
                      className="h-8 px-3 sm:px-3.5 rounded-xl text-xs font-semibold bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground transition-all active:scale-[0.98] cursor-pointer shadow-xs"
                    >
                      Sign up free
                    </Button>
                  }
                />
              </div>
            )}
          </div>
        </nav>
      </header>
    </div>
  );
}
