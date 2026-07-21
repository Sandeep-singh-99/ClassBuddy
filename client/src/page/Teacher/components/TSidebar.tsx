import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { SidebarThemeToggle } from "@/components/SidebarThemeToggle";
import {
  Home,
  FilePlus,
  Files,
  FolderOpen,
  ClipboardList,
  Sparkles,
  IndianRupee,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const MenuOptions = [
  {
    title: "Dashboard",
    url: "/t-dashboard/home",
    icon: Home,
    badge: null,
  },
  {
    title: "New Note",
    url: "/t-dashboard/create-notes",
    icon: FilePlus,
    badge: "Create",
  },
  {
    title: "My Notes",
    url: "/t-dashboard/view-notes",
    icon: Files,
    badge: null,
  },
  {
    title: "Resources",
    url: "/t-dashboard/docs",
    icon: FolderOpen,
    badge: null,
  },
  {
    title: "Assignments",
    url: "/t-dashboard/assignments",
    icon: ClipboardList,
    badge: null,
  },
  {
    title: "Payment",
    url: "/t-dashboard/payment",
    icon: IndianRupee,
    badge: "Pro",
  },
];

export default function TSideBar() {
  const { open } = useSidebar();
  const location = useLocation();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border/60 bg-sidebar text-sidebar-foreground transition-all duration-300"
    >
      {/* ── 1. Sidebar Header / Logo ────────────────────────────────────── */}
      <SidebarHeader className="p-4 pb-2 border-b border-sidebar-border/40">
        <Link
          to="/"
          className="flex items-center gap-3 group px-1 py-1 rounded-xl transition-all duration-200"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-primary via-blue-600 to-indigo-600 text-white shadow-md group-hover:scale-105 transition-transform duration-300">
            <GraduationCap className="h-5 w-5" />
          </div>

          {open && (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-sidebar-foreground">
                  ClassBuddy
                </span>
                <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Teacher Hub
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      {/* ── 2. Sidebar Navigation Content ───────────────────────────────── */}
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          {open && (
            <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 mb-2 px-3">
              Teacher Navigation
            </SidebarGroupLabel>
          )}

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {MenuOptions.map((option) => {
                const IconComponent = option.icon;
                const isActive =
                  location.pathname === option.url ||
                  (option.url !== "/t-dashboard/home" &&
                    location.pathname.startsWith(option.url));

                return (
                  <SidebarMenuItem key={option.url}>
                    <SidebarMenuButton
                      asChild
                      size={open ? "lg" : "default"}
                      tooltip={!open ? option.title : undefined}
                      className={cn(
                        "relative flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group/btn",
                        isActive
                          ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary font-semibold shadow-xs border border-primary/20"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Link to={option.url} className="flex items-center w-full">
                        <div className="flex items-center gap-3">
                          <IconComponent
                            className={cn(
                              "h-5 w-5 shrink-0 transition-all duration-200",
                              isActive
                                ? "text-primary scale-110"
                                : "text-muted-foreground group-hover/btn:text-foreground group-hover/btn:scale-105"
                            )}
                          />
                          {open && <span>{option.title}</span>}
                        </div>

                        {open && (
                          <div className="flex items-center gap-1.5 ml-auto">
                            {option.badge && (
                              <Badge
                                variant={isActive ? "default" : "secondary"}
                                className={cn(
                                  "text-[10px] font-bold px-1.5 py-0 rounded-md border-0",
                                  option.badge === "Pro" &&
                                    "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                )}
                              >
                                {option.badge}
                              </Badge>
                            )}
                            <ChevronRight
                              className={cn(
                                "h-3.5 w-3.5 transition-transform duration-200 opacity-0 group-hover/btn:opacity-100",
                                isActive && "opacity-100 text-primary"
                              )}
                            />
                          </div>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── 3. Sidebar Footer / Theme Toggle ────────────────────────────── */}
      <SidebarFooter className="p-3 border-t border-sidebar-border/40">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-sidebar-accent/50 border border-sidebar-border/40">
              {open && (
                <span className="text-xs font-medium text-muted-foreground pl-2">
                  Theme Mode
                </span>
              )}
              <SidebarThemeToggle />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
