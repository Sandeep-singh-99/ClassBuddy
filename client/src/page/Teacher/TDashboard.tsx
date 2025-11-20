import AppHeader from "@/components/AppHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import TSideBar from "./components/TSidebar";

export default function TDashboard() {
  return (
    <SidebarProvider>
      <TSideBar />
      <div className="w-full p-5">
        <AppHeader />
        <Outlet />
      </div>
    </SidebarProvider>
  )
}
