import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from './ui/sidebar'
import { BookOpenCheck, File, GraduationCap, LayoutDashboard, LayoutGridIcon, NotebookIcon, Sparkles, User2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const MenuOptions = [
  {
    title: "Home",
    url: "/dashboard-panel/home",
    icon: <LayoutDashboard />,
  },
   {
    title: "All Teachers",
    url: "/dashboard-panel/view-teachers",
    icon: <User2 />,
  },
   {
    title: "Notes",
    url: "/dashboard-panel/notes",
    icon: <NotebookIcon />,
  },
   {
    title: "Docs",
    url: "/dashboard-panel/docs",
    icon: <File />,
  },
   {
    title: "Interview Preparation",
    url: "/dashboard-panel/interview-prep",
    icon: <GraduationCap />,
  },
   {
    title: "Career Insights",
    url: "/dashboard-panel/dashboard",
    icon: <LayoutGridIcon />,
  },
  {
    title: "Assignments",
    url: "/dashboard-panel/assignments",
    icon: <BookOpenCheck />,
  },
];


export default function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <Link to={"/"} className='flex items-center gap-2 text-yellow-400'>
          <Sparkles />
          <span className="text-3xl font-bold">Class Buddy</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Student Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MenuOptions.map((option, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton asChild>
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
