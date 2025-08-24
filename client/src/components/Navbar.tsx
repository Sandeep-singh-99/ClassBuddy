import { Contact, LayoutDashboard, Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthComponent from "./AuthComponent";
import { Button } from "./ui/button";
import { useAppSelector } from "@/hooks/hooks";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

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

        {/* Desktop Links */}
       {
        user ? (
           <div className="hidden md:flex items-center gap-4 text-gray-300">
          <Link to={"/contact"} className="hover:text-yellow-400 transition">
            <Button variant={"outline"}>
              <Contact />
              Contact
            </Button>
          </Link>


          <Link to={"/dashboard"} className="hover:text-yellow-400 transition">
            <Button variant={"outline"}>
              <LayoutDashboard />
              Dashboard
            </Button>
          </Link>

          <Link to={"/profile"} className="hover:text-yellow-400 transition">
            <img src={user.image_url} alt={user.full_name} className="w-8 h-8 rounded-full" />
          </Link>
        </div>
        ) : (
          <AuthComponent />
        )
       }

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-300"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu className="w-7 h-7" />
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#0c1729] border-t border-gray-800 flex flex-col items-center py-6 space-y-4">
          <a
            href="#home"
            className="text-gray-300 hover:text-yellow-400 transition"
          >
            Home
          </a>
          <a
            href="#features"
            className="text-gray-300 hover:text-yellow-400 transition"
          >
            Features
          </a>
          <a
            href="#testimonials"
            className="text-gray-300 hover:text-yellow-400 transition"
          >
            Testimonials
          </a>
          <Link
            to={"/contact"}
            className="text-gray-300 hover:text-yellow-400 transition"
          >
            Contact
          </Link>
          <AuthComponent />
        </div>
      )}
    </nav>
  );
}
