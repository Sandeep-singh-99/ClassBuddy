import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { ChatSidebar } from "./components/ChatSidebar";
import { mockUsers } from "./mockData";
import type { User } from "./mockData";

export default function ChatPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);

  /* 
    The path "/chat-panel" contains "/chat", so we need to be specific 
    to avoid hiding the sidebar on the main list view.
  */
  const isChatOpen = location.pathname.includes("/chat-panel/chat");

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    navigate(`chat?userId=${user.id}`);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background shadow-sm">
      <div
        className={`${
          isChatOpen ? "hidden md:block" : "w-full"
        } md:w-auto h-full`}
      >
        <ChatSidebar
          users={mockUsers}
          selectedUserId={selectedUser?.id}
          onSelectUser={handleSelectUser}
        />
      </div>
      <div
        className={`flex-1 flex flex-col h-full overflow-hidden ${
          !isChatOpen ? "hidden md:flex" : ""
        }`}
      >
        <Outlet context={{ selectedUser }} />
      </div>
    </div>
  );
}
