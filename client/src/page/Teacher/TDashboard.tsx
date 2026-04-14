import AppHeader from "@/components/AppHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import TSideBar from "./components/TSidebar";
import { Toaster } from "@/components/ui/sonner"

export default function TDashboard() {
  return (
    <SidebarProvider>
      <TSideBar />
      <div className="w-full p-5 bg-background text-foreground">
         <Toaster />
        <AppHeader />
        <Outlet />
      </div>
    </SidebarProvider>
  );
}
