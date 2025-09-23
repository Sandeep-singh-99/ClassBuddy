import { Outlet } from "react-router-dom"
import SideBar from "../../components/Sidebar"
import { ToastContainer } from "react-toastify"

function DashboardPanel() {
  return (
    <div className="min-h-screen w-full flex">
      {/* Sidebar - fixed width, full height */}
      <div className="md:w-64  md:bg-[#0c1729] md:border-r md:border-gray-800 fixed h-screen">
        <SideBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 bg-gradient-to-br from-[#0c1729] via-[#13233f] to-[#0c1729] min-h-screen p-4 overflow-y-auto">
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
  )
}

export default DashboardPanel