import { Outlet, useLocation } from "react-router-dom";
import { ChatSidebar } from "./components/ChatSidebar";

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
        <Outlet />
      </div>
    </div>
  );
}
