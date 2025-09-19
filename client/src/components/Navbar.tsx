import { ChartPieIcon, LayoutDashboard, LogOutIcon } from "lucide-react";
import { Link } from "react-router-dom";
import AuthComponent from "./AuthComponent";
import { useAppSelector } from "@/hooks/hooks";
import { useAppDispatch } from "@/hooks/hooks";
import { logout } from "@/redux/slice/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export default function Navbar() {

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout()).then(() => {
      toast.success("Logged out successfully");
    })
    navigate("/");
  };

  const { user } = useAppSelector((state) => state.auth);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0c1729]/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          to={"/"}
          className="text-2xl font-bold text-yellow-400 tracking-tight"
        >
          ClassBuddy
        </Link>
        {
          user ? (
            <div className="flex items-center gap-4 text-gray-300">
              {/* <Link to={"/contact"} className="hover:text-yellow-400 transition">
            <Button variant={"outline"}>
              <Contact />
              Contact
            </Button>
          </Link> */}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <img src={user.image_url} alt={user.full_name} className="w-8 h-8 rounded-full object-cover" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="" align="end" sideOffset={5}>
                  {
                    user.role === "teacher" ? (
                      <DropdownMenuGroup>
                        <DropdownMenuItem>
                          <Link to={"/t-dashboard/home"} className="transition flex gap-2">
                            <LayoutDashboard />
                            <p className="hidden md:inline">Dashboard</p>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                          <LogOutIcon />
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    ) : (
                      <DropdownMenuGroup>
                        <DropdownMenuItem>
                          <Link to={"/dashboard-panel/home"} className="transition flex gap-2">
                            <LayoutDashboard />
                            <p className="hidden md:inline">Dashboard</p>
                          </Link>
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem>
                          <Link to={"/dashboard-panel/chat"} className="transition flex gap-2">
                            <ChartPieIcon />
                            <p className="hidden md:inline">Chat</p>
                          </Link>
                        </DropdownMenuItem> */}
                        <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                          <LogOutIcon />
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    )
                  }
                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          ) : (
            <AuthComponent />
          )
        }
      </div>
    </nav>
  );
}