import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import App from "@/App";
import RoleProtectedRoute from "@/components/ProtectedRoute/RoleProtectedRoute";
import NotFound from "@/page/NotFound";
import ChatHome from "@/page/ChatDashboard/ChatPanel";

// Lazy-loaded pages
const Home = lazy(() => import("@/page/Home"));
const Chat = lazy(() => import("@/page/ChatDashboard/Chat"));
const DashboardPanel = lazy(() => import("@/page/Dashboard/DashboardPanel"));
const DashboardHome = lazy(() => import("@/page/Dashboard/DashboardHome"));
const ViewAllTeacher = lazy(() => import("@/page/Dashboard/ViewAllTeacher"));
const Notes = lazy(() => import("@/page/Dashboard/Notes"));
const InterviewPerPage = lazy(
  () => import("@/page/Dashboard/Quiz/InterviewPerPage")
);
const Mock = lazy(() => import("@/page/Dashboard/Quiz/Mock"));
const DocView = lazy(() => import("@/page/Dashboard/DocView"));
const CareerDashboard = lazy(() => import("@/page/Dashboard/CareerDashboard"));
const Assignment = lazy(() => import("@/page/Dashboard/Assignment"));
const AssignmentViewById = lazy(
  () => import("@/page/Dashboard/AssignmentViewById")
);
const AssignmentDetails = lazy(
  () => import("@/page/Dashboard/AssignmentDetails")
);

// Teacher
const TDashboard = lazy(() => import("@/page/Teacher/TDashboard"));
const THome = lazy(() => import("@/page/Teacher/THome"));
const TNotes = lazy(() => import("@/page/Teacher/TNotes"));
const ViewNotes = lazy(() => import("@/page/Teacher/ViewNotes"));
const UpdatedNote = lazy(() => import("@/page/Teacher/UpdatedNote"));
const TAssignment = lazy(() => import("@/page/Teacher/TAssignment"));
const Docs = lazy(() => import("@/page/Teacher/Docs"));
const DocsById = lazy(() => import("@/page/Teacher/DocsById"));
const TAssignmentViewById = lazy(
  () => import("@/page/Teacher/TAssignmentViewById")
);

// Insights
const InsightHome = lazy(() => import("@/page/Teacher/Insight/InsightHome"));
const TInsight = lazy(() => import("@/page/Teacher/Insight/TInsight"));

// Skeletons
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import PaymentPage from "@/page/Teacher/PaymentPage";
import Payment from "@/page/Dashboard/Payment";

// Notes and view pages
const ViewNoteById = lazy(() => import("@/page/Teacher/ViewNoteById"));
const OAuthCallback = lazy(() => import("@/page/OAuthCallback"));

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <NotFound />,
    element: (
      <Suspense
        fallback={
          <div className="text-center py-20 text-gray-400"></div>
        }
      >
        <App />
      </Suspense>
    ),
    children: [
      { path: "", element: <Home /> },
      { path: "oauth/callback", element: <OAuthCallback /> },
      { path: "view-notes/:noteId", element: <ViewNoteById /> },
      { path: "docs/:docId", element: <DocsById /> },
      { path: "*", element: <NotFound /> },
    ],
  },


  {
    path: "dashboard-panel",
    errorElement: <NotFound />,
    element: (
      <RoleProtectedRoute allowedRoles={["student"]}>
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardPanel />
        </Suspense>
      </RoleProtectedRoute>
    ),
    children: [
      { path: "home", element: <DashboardHome /> },
      { path: "view-teachers", element: <ViewAllTeacher /> },
      { path: "notes", element: <Notes /> },
      { path: "interview-prep", element: <InterviewPerPage /> },
      { path: "mock/:id", element: <Mock /> },
      { path: "docs", element: <DocView /> },
      { path: "dashboard", element: <CareerDashboard /> },
      { path: "assignments", element: <Assignment /> },
      { path: "assignments/:assignmentId", element: <AssignmentViewById /> },
      {
        path: "assignments-details/:assignmentId",
        element: <AssignmentDetails />,
      },
      { path: "payments", element: <Payment /> },
    ],
  },

  {
    path: "t-dashboard",
    errorElement: <NotFound />,
    element: (
      <RoleProtectedRoute allowedRoles={["teacher"]}>
        <Suspense fallback={<DashboardSkeleton />}>
          <TDashboard />
        </Suspense>
      </RoleProtectedRoute>
    ),
    children: [
      { path: "home", element: <THome /> },
      {
        path: "create-notes",
        element: (
          <RoleProtectedRoute allowedRoles={["teacher"]} requireGroup={true}>
            <TNotes />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "view-notes",
        element: (
          <RoleProtectedRoute allowedRoles={["teacher"]} requireGroup={true}>
            <ViewNotes />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "update-note/:noteId",
        element: (
          <RoleProtectedRoute allowedRoles={["teacher"]} requireGroup={true}>
            <UpdatedNote />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "assignments",
        element: (
          <RoleProtectedRoute allowedRoles={["teacher"]} requireGroup={true}>
            <TAssignment />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "docs",
        element: (
          <RoleProtectedRoute allowedRoles={["teacher"]} requireGroup={true}>
            <Docs />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "assignments/:assignmentId",
        element: (
          <RoleProtectedRoute allowedRoles={["teacher"]} requireGroup={true}>
            <TAssignmentViewById />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "payment",
        element: (
          <RoleProtectedRoute allowedRoles={["teacher"]} requireGroup={true}>
            <PaymentPage />
          </RoleProtectedRoute>
        ),
      },
    ],
  },

  {
    path: "t-insights",
    errorElement: <NotFound />,
    element: (
      <RoleProtectedRoute allowedRoles={["teacher"]}>
        <Suspense fallback={<DashboardSkeleton />}>
          <InsightHome />
        </Suspense>
      </RoleProtectedRoute>
    ),
    children: [{ path: "", element: <TInsight /> }],
  },


  {
    path: "chat-panel",
    errorElement: <NotFound />,
    element: <ChatHome />,
    children: [
      {
        path: "chat",
        element: <Chat />,
      },
    ],
  },
]);
