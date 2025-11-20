import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from './ui/sidebar'
import { Link } from 'react-router-dom'

import {
  LayoutDashboard,
  Users,
  Notebook,
  FolderOpen,
  MessageSquareQuote,
  LineChart,
  ClipboardList,
  Sparkles,
} from "lucide-react";


const MenuOptions = [
  {
    title: "Dashboard",
    url: "/dashboard-panel/home",
    icon: <LayoutDashboard />,
  },
  {
    title: "Teachers",
    url: "/dashboard-panel/view-teachers",
    icon: <Users />,
  },
  {
    title: "Notes",
    url: "/dashboard-panel/notes",
    icon: <Notebook />,
  },
  {
    title: "Resources",
    url: "/dashboard-panel/docs",
    icon: <FolderOpen />,
  },
  {
    title: "Interview Prep",
    url: "/dashboard-panel/interview-prep",
    icon: <MessageSquareQuote />,
  },
  {
    title: "Career Insights",
    url: "/dashboard-panel/dashboard",
    icon: <LineChart />,
  },
  {
    title: "Assignments",
    url: "/dashboard-panel/assignments",
    icon: <ClipboardList />,
  },
];


export default function AppSidebar() {
  const { open } = useSidebar();
  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <Link to={"/"} className='flex items-center gap-2 text-yellow-400'>
          <Sparkles />
          { open && <span className="text-3xl font-bold">Class Buddy</span> }
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Student Dashboard</SidebarGroupLabel>
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
  )
}
