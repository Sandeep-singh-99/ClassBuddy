import AppHeader from "@/components/AppHeader";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import TSideBar from "./components/TSidebar";
import { Toaster } from "@/components/ui/sonner";

export default function TDashboard() {
  return (
    <SidebarProvider>
      <TSideBar />
      <div className="w-full p-5 bg-background text-foreground">
        <Toaster />
        <AppHeader />
        <Suspense fallback={<DashboardSkeleton />}>
          <Outlet />
        </Suspense>
      </div>
    </SidebarProvider>
  );
}
