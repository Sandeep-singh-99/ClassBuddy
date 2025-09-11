import TSideBar from "@/page/Teacher/components/TSidebar";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";

export default function TDashboard() {
  return (
    <div className="min-h-screen w-full flex">
      {/* Sidebar - fixed width, full height */}
      <div className="w-64 bg-[#0c1729] border-r border-gray-800 fixed h-screen">
        <TSideBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 bg-gradient-to-br from-[#0c1729] via-[#13233f] to-[#0c1729] min-h-screen p-4 overflow-y-auto">
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
