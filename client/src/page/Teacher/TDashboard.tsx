import AppHeader from "@/components/AppHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import TSideBar from "./components/TSidebar";

export default function TDashboard() {
  return (
    <SidebarProvider>
      <TSideBar />
      <div className="w-full p-5 bg-gradient-to-br from-[#0c1729] via-[#13233f] to-[#0c1729]">
        <AppHeader />
        <Outlet />
      </div>
    </SidebarProvider>
  )
}
