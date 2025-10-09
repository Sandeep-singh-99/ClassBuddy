import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { TSideBar } from "./components/TSidebar";
import { Button } from "@/components/ui/button";

export default function TDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen w-full flex">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed h-screen w-64 bg-[#0c1729] md:border-r md:border-gray-800 z-40">
          <TSideBar setIsOpen={setSidebarOpen} />
        </div>
      )}

      {/* Toggle Button (ALWAYS VISIBLE) */}
      <Button
      variant={"destructive"}
        className={`fixed top-2 left-4 z-50 bg-[#0c1729] text-white p-2 rounded-full shadow-md transition-all duration-300
          ${sidebarOpen ? "md:left-64 mx-2 left-64" : "md:left-4 left-4"}`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Main Content */}
      <div
        className={`flex-1 bg-gradient-to-br from-[#0c1729] via-[#13233f] to-[#0c1729] min-h-screen px-10 overflow-y-auto transition-all duration-300 ${
          sidebarOpen ? "md:ml-64" : "md:ml-0"
        }`}
      >
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        <Outlet />
      </div>
    </div>
  );
}
