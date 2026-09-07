import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ChatSidebar } from "./components/ChatSidebar";
import { Loader2 } from "lucide-react";

export default function ChatPanel() {
  const location = useLocation();

  const isChatOpen = location.pathname.includes("/chat-panel/chat");

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background shadow-sm">
      <div
        className={`${
          isChatOpen ? "hidden md:block" : "w-full"
        } md:w-auto h-full`}
      >
        <ChatSidebar />
      </div>
      <div
        className={`flex-1 flex flex-col h-full overflow-hidden ${
          !isChatOpen ? "hidden md:flex" : ""
        }`}
      >
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <span className="text-sm font-medium">Loading Chat...</span>
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}
