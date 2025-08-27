import App from "@/App";
import ChatPage from "@/page/Dashboard/ChatPage";
import ContactPage from "@/page/ContactPage";
import DashboardPanel from "@/page/Dashboard/DashboardPanel";
import Home from "@/page/Home";
import Profile from "@/page/Profile";
import { createBrowserRouter } from "react-router-dom";
import DashboardHome from "@/page/Dashboard/DashboardHome";
import THome from "@/page/Teacher/THome";
import TDashboard from "@/page/Teacher/TDashboard";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "",
                element: <Home />
            },
            {
                path: "contact",
                element: <ContactPage />
            },
            {
                path: "profile",
                element: <Profile />
            },
        ]
    },

    {
        path: "dashboard-panel",
        element: <DashboardPanel />,
        children: [
            {
                path: "home",
                element: <DashboardHome />
            },
            {
                path: "chat",
                element: <ChatPage />
            }
        ]
    },

    {
        path: "t-dashboard",
        element: <TDashboard />,
        children: [
            {
                path: "home",
                element: <THome />
            }
        ]
    },
])