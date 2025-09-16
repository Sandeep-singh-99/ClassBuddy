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
import TInsight from "@/page/Teacher/Insight/TInsight";
import InsightHome from "@/page/Teacher/Insight/InsightHome";
import ViewAllTeacher from "@/page/Dashboard/ViewAllTeacher";
import TNotes from "@/page/Teacher/TNotes";
import ViewNotes from "@/page/Teacher/ViewNotes";
import ViewNoteById from "@/page/Teacher/ViewNoteById";
import Notes from "@/page/Dashboard/Notes";
import UpdatedNote from "@/page/Teacher/UpdatedNote";
import QuizPerPage from "@/page/Dashboard/QuizPerPage";
import Mock from "@/page/Dashboard/mock";

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
            {
                path: "view-notes/:noteId",
                element: <ViewNoteById />
            }
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
            },
            {
                path: "view-teachers",
                element: <ViewAllTeacher />
            },
            {
                path: "notes",
                element: <Notes />
            },
            {
                path: "quiz-per",
                element: <QuizPerPage />
            },
            {
                path: "mock",
                element: <Mock />
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
            },
            {
                path: "create-notes",
                element: <TNotes /> 
            },
            {
                path: "view-notes",
                element: <ViewNotes />
            },
            {
                path: "update-note/:noteId",
                element: <UpdatedNote />
            }
        ]
    },

    {
        path: "t-insights",
        element: <InsightHome />,
        children: [
            {
                path: "",
                element: <TInsight />
            }
        ]
    }
])