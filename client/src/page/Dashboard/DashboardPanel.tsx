import AppHeader from '@/components/AppHeader'
import AppSidebar from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Outlet } from 'react-router-dom'

export default function DashboardPanel() {
  return (
    <SidebarProvider>
      <AppSidebar />
     <div className='w-full p-5 bg-gradient-to-b from-white via-gray-50 to-white'>
      <AppHeader />
       <Outlet />
     </div>
    </SidebarProvider>
  )
}
