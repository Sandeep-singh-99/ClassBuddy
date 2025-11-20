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
} from "@/components/ui/sidebar";
import {
  Home,
  FilePlus,
  Files,
  FolderOpen,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const MenuOptions = [
  {
    title: "Dashboard",
    url: "/t-dashboard/home",
    icon: <Home />,
  },
  {
    title: "New Note",
    url: "/t-dashboard/create-notes",
    icon: <FilePlus />,
  },
  {
    title: "My Notes",
    url: "/t-dashboard/view-notes",
    icon: <Files />,
  },
  {
    title: "Resources",
    url: "/t-dashboard/docs",
    icon: <FolderOpen />,
  },
  {
    title: "Assignments",
    url: "/t-dashboard/assignments",
    icon: <ClipboardList />,
  },
];

export default function TSideBar() {
  const { open } = useSidebar();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to={"/"} className="flex items-center gap-2 text-yellow-400">
          <Sparkles />
          {open && <span className="text-3xl font-bold">Class Buddy</span>}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Teacher Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MenuOptions.map((option, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton asChild size={open ? "lg" : "default"}>
                    <Link to={option.url}>
                      {option.icon}
                      <span>{option.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
