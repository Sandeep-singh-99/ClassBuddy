import AppHeader from "@/components/AppHeader";
import AppSidebar from "@/components/AppSidebar";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";

export default function DashboardPanel() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full p-5 bg-background text-foreground">
        <AppHeader />
        <Suspense fallback={<DashboardSkeleton />}>
          <Outlet />
        </Suspense>
      </div>
    </SidebarProvider>
  );
}
