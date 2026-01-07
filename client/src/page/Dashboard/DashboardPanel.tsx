import AppHeader from "@/components/AppHeader";
import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";

export default function DashboardPanel() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full p-5 bg-background text-foreground">
        <AppHeader />
        <Outlet />
      </div>
    </SidebarProvider>
  );
}
