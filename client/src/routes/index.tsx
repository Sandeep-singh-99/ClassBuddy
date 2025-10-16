import App from "@/App";
import ChatPage from "@/page/Dashboard/ChatPage";
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
import InterviewPerPage from "@/page/Dashboard/InterviewPerPage";
import Mock from "@/page/Dashboard/Mock";
import TAssignment from "@/page/Teacher/TAssignment";
import Docs from "@/page/Teacher/Docs";
import DocsById from "@/page/Teacher/DocsById";
import DocView from "@/page/Dashboard/DocView";
import RoleProtectedRoute from "@/components/ProtectedRoute/RoleProtectedRoute";
import NotFound from "@/page/NotFound";
import CareerDashboard from "@/page/Dashboard/CareerDashboard";
import TAssignmentViewById from "@/page/Teacher/TAssignmentViewById";
import Assignment from "@/page/Dashboard/Assignment";
import AssignmentViewById from "@/page/Dashboard/AssignmentViewById";
import AssignmentDetails from "@/page/Dashboard/AssignmentDetails";

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
                path: "profile",
                element: <Profile />
            },
            {
                path: "view-notes/:noteId",
                element: <ViewNoteById />
            },
            {
                path: "docs/:docId",
                element: <DocsById />
            },
            {
                path: "*",
                element: <NotFound />
            }
        ]
    },

    {
        path: "dashboard-panel",
        element: (
            <RoleProtectedRoute allowedRoles={['student']} >
                <DashboardPanel />
            </RoleProtectedRoute>
        ),
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
                path: "interview-prep",
                element: <InterviewPerPage />
            }, 
            {
                path: "mock",
                element: <Mock />
            },
            {
                path: "docs",
                element: <DocView />
            },
            {
                path: "dashboard",
                element: <CareerDashboard />
            },
            {
                path: "assignments",
                element: <Assignment />
            },
            {
                path: "assignments/:assignmentId",
                element: <AssignmentViewById />
            },
            {
                path: "assignments-details/:assignmentId",
                element: <AssignmentDetails />
            }
        ]
    },

    {
        path: "t-dashboard",
        element: (
            <RoleProtectedRoute allowedRoles={['teacher']} >
                <TDashboard />
            </RoleProtectedRoute>
        ),
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
            },
            {
                path: "assignments",
                element: <TAssignment />
            },
            {
                path: "docs",
                element: <Docs />
            },
            {
                path: "assignments/:assignmentId",
                element: <TAssignmentViewById />
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