import { Outlet } from "react-router-dom"
import SideBar from "../../components/Sidebar"
import { ToastContainer } from "react-toastify"

function DashboardPanel() {
  return (
     <div className="min-h-screen w-full">
      <div className="flex">
        <SideBar />
        <div className="flex-1 bg-gradient-to-br from-[#0c1729] via-[#13233f] to-[#0c1729]">
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default DashboardPanel