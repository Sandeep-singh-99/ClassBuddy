import AppHeader from "@/components/AppHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import TSideBar from "./components/TSidebar";
import { ToastContainer } from "react-toastify";

export default function TDashboard() {
  return (
    <SidebarProvider>
      <TSideBar />
      <div className="w-full p-5 bg-background text-foreground">
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
        <AppHeader />
        <Outlet />
      </div>
    </SidebarProvider>
  );
}
