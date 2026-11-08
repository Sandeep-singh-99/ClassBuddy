import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarFooter,
} from "./ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { SidebarThemeToggle } from "@/components/SidebarThemeToggle";
import {
  LayoutDashboard,
  Users,
  Notebook,
  FolderOpen,
  MessageSquareQuote,
  LineChart,
  ClipboardList,
  Sparkles,
  IndianRupee,
  GraduationCap,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const MenuOptions = [
  {
    title: "Dashboard",
    url: "/dashboard-panel/home",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: "Community Chat",
    url: "/chat-panel/chat",
    icon: MessageCircle,
    badge: "Live",
  },
  {
    title: "Teachers",
    url: "/dashboard-panel/view-teachers",
    icon: Users,
    badge: null,
  },
  {
    title: "Notes",
    url: "/dashboard-panel/notes",
    icon: Notebook,
    badge: null,
  },
  {
    title: "Resources",
    url: "/dashboard-panel/docs",
    icon: FolderOpen,
    badge: null,
  },
  {
    title: "Interview Prep",
    url: "/dashboard-panel/interview-prep",
    icon: MessageSquareQuote,
    badge: "AI",
  },
  {
    title: "Career Insights",
    url: "/dashboard-panel/dashboard",
    icon: LineChart,
    badge: "New",
  },
  {
    title: "Assignments",
    url: "/dashboard-panel/assignments",
    icon: ClipboardList,
    badge: null,
  },
  {
    title: "Payments",
    url: "/dashboard-panel/payments",
    icon: IndianRupee,
    badge: "Plans",
  },
];

export default function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border/60 bg-sidebar text-sidebar-foreground transition-all duration-300"
    >
      {/* ── 1. Sidebar Header / Logo ────────────────────────────────────── */}
      <SidebarHeader
        className={cn(
          "border-b border-sidebar-border/40 transition-all duration-300",
          open ? "p-4 pb-2" : "p-2 py-3 flex items-center justify-center"
        )}
      >
        <Link
          to="/"
          className={cn(
            "flex items-center group rounded-xl transition-all duration-200",
            open ? "gap-3 px-1 py-1" : "justify-center p-0"
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-primary via-indigo-600 to-violet-600 text-white shadow-md group-hover:scale-105 transition-transform duration-300">
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
                Student Hub
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      {/* ── 2. Sidebar Navigation Content ───────────────────────────────── */}
      <SidebarContent
        className={cn(
          "py-4 transition-all duration-300",
          open ? "px-2" : "px-1.5"
        )}
      >
        <SidebarGroup className={cn(!open && "p-0")}>
          {open && (
            <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 mb-2 px-3">
              Student Navigation
            </SidebarGroupLabel>
          )}

          <SidebarGroupContent>
            <SidebarMenu className={cn("space-y-1", !open && "items-center")}>
              {MenuOptions.map((option) => {
                const IconComponent = option.icon;
                const isActive =
                  location.pathname === option.url ||
                  (option.url !== "/dashboard-panel/home" &&
                    location.pathname.startsWith(option.url));

                return (
                  <SidebarMenuItem
                    key={option.url}
                    className={cn(!open && "flex justify-center w-full")}
                  >
                    <SidebarMenuButton
                      asChild
                      size={open ? "lg" : "default"}
                      tooltip={!open ? option.title : undefined}
                      className={cn(
                        "relative rounded-xl text-sm font-medium transition-all duration-200 group/btn",
                        open
                          ? "flex items-center justify-between px-3 py-2.5"
                          : "flex items-center justify-center size-9 p-0 mx-auto",
                        isActive
                          ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary font-semibold shadow-xs border border-primary/20"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Link
                        to={option.url}
                        className={cn(
                          "flex items-center",
                          open ? "w-full justify-between" : "w-full h-full justify-center"
                        )}
                      >
                        <div
                          className={cn(
                            "flex items-center",
                            open ? "gap-3" : "justify-center w-full"
                          )}
                        >
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
                                  option.badge === "AI" &&
                                    "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
                                  option.badge === "Live" &&
                                    "bg-rose-500/15 text-rose-600 dark:text-rose-400",
                                  option.badge === "New" &&
                                    "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
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
      <SidebarFooter
        className={cn(
          "border-t border-sidebar-border/40 transition-all duration-300",
          open ? "p-3" : "p-2"
        )}
      >
        <SidebarMenu className={cn(!open && "items-center")}>
          <SidebarMenuItem className={cn(!open && "flex justify-center w-full")}>
            <div
              className={cn(
                "flex items-center rounded-xl bg-sidebar-accent/50 border border-sidebar-border/40 transition-all duration-300",
                open ? "justify-between gap-2 p-1.5" : "justify-center p-1 w-full"
              )}
            >
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
