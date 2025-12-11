import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageBubble } from "./components/MessageBubble";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import {
  fetchMessages,
  sendMessage,
  setActiveGroup,
  addMessage,
} from "@/redux/slice/chatSlice";

export default function Chat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get("groupId");
  const scrollRef = useRef<HTMLDivElement>(null);

  const dispatch = useAppDispatch();
  const { messages, activeGroup, groups, messageLoading } = useAppSelector(
    (state) => state.chat
  );
  const { user } = useAppSelector((state) => state.auth);

  const [inputValue, setInputValue] = useState("");

  // Sync URL groupId with Redux activeGroup and fetch messages
  useEffect(() => {
    if (groupId) {
      if (!activeGroup || activeGroup.id !== groupId) {
        // If groups are loaded, find and set active group
        const group = groups.find((g) => g.id === groupId);
        if (group) {
          dispatch(setActiveGroup(group));
        }
      }
      // Always fetch messages when groupId changes
      dispatch(fetchMessages(groupId));
    }
  }, [groupId, groups, dispatch]);

  // WebSocket Connection
  useEffect(() => {
    if (!groupId) return;

    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    const wsUrl = baseUrl.replace(/^http/, "ws").replace(/^https/, "wss");
    const socketUrl = `${wsUrl}/group-messages/ws/${groupId}`;

    const ws = new WebSocket(socketUrl);

    ws.onopen = () => {
      console.log("Connected to Chat WS");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Dispatch addMessage action
        dispatch(addMessage(data));
      } catch (error) {
        console.error("Failed to parse WS message", error);
      }
    };

    ws.onclose = () => {
      console.log("Chat WS disconnected");
    };

    return () => {
      ws.close();
    };
  }, [groupId, dispatch]);

  useEffect(() => {
    if (scrollRef.current) {
      // Find the scrollable viewport element inside ScrollArea
      const viewport = scrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (viewport) {
        // Use setTimeout to ensure DOM has updated
        setTimeout(() => {
          viewport.scrollTop = viewport.scrollHeight;
        }, 100);
      }
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || !groupId) return;

    dispatch(sendMessage({ groupId, message: inputValue }));
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!groupId || !activeGroup) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10 dark:bg-grid-slate-700/20" />

        <div className="flex flex-col items-center gap-4 p-8 text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative bg-background/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-border/50 ring-1 ring-black/5">
              <MessageSquare className="h-12 w-12 text-primary" />
            </div>
          </div>

          <div className="space-y-2 max-w-sm">
            <h3 className="text-2xl font-bold tracking-tight">
              Welcome to ClassBuddy Chat
            </h3>
            <p className="text-muted-foreground">
              Select a group from the sidebar to start collaborating with your
              classmates and teachers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10 dark:bg-grid-slate-700/20" />

      {/* Chat Header */}
      <div className="sticky top-0 z-10 flex items-center gap-4 p-4 border-b border-border/40 bg-background/80 backdrop-blur-md shadow-sm shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden -ml-2"
          onClick={() => navigate("/chat-panel")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Button>
        <div className="relative">
          <Avatar className="h-10 w-10 border border-border shadow-sm">
            <AvatarImage
              src={activeGroup.image_url || activeGroup.owner?.image_url || ""}
              alt={activeGroup.group_name}
            />
            <AvatarFallback>
              {activeGroup.group_name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {/* Status indicator removed for groups */}
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold tracking-tight">
            {activeGroup.group_name}
          </span>
          <span className="text-xs text-muted-foreground capitalize font-medium">
            {activeGroup.group_des || "Class Group"}
          </span>
        </div>
      </div>

      {/* Message List */}
      <ScrollArea className="flex-1 p-4 min-h-0" ref={scrollRef}>
        <div className="flex flex-col gap-4 max-w-4xl mx-auto pb-4">
          {messageLoading && messages.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm mt-10">
              Loading messages...
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={{
                  id: msg.id,
                  content: msg.message,
                  timestamp: msg.created_at,
                  status: "read",
                  senderId: msg.sender_id,
                  receiverId: msg.group_id,
                }}
                isCurrentUser={msg.sender_id === user?.id}
                senderName={msg.sender?.full_name || "Unknown"}
                senderAvatar={msg.sender?.image_url || ""}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 bg-transparent">
        <div className="flex w-full items-end gap-2 max-w-4xl mx-auto bg-background/80 backdrop-blur-md p-2 rounded-3xl border border-black/30 shadow-lg ring-1 ring-black/5 dark:ring-white/10">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10 text-muted-foreground hover:bg-muted/50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </Button>
          <Textarea
            placeholder="Type your message..."
            className="min-h-[24px] max-h-[150px] py-3 bg-transparent border-0 focus-visible:ring-0 resize-none shadow-none"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button
            size="icon"
            className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 shadow-md transition-all hover:scale-105 active:scale-95 mb-0.5"
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
