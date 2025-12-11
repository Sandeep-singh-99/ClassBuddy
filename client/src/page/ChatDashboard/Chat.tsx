import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageBubble } from "./components/MessageBubble";
import { mockMessages, mockUsers, currentUser } from "./mockData";
import { cn } from "@/lib/utils";
import type { Message } from "./mockData";

export default function Chat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");

  // In a real app, we would fetch messages for this userId
  // For now, we just filter or use all messages for demo purposes
  // and we'll pretend the conversation is just with the first user if none selected

  const targetUser = mockUsers.find((u) => u.id === userId) || mockUsers[0];

  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      // Find the scrollable viewport element inside ScrollArea
      const viewport = scrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: targetUser.id,
      content: inputValue,
      timestamp: new Date().toISOString(),
      status: "sent",
    };

    setMessages([...messages, newMessage]);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!targetUser) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a user to chat
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background/30 relative">
      <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10 dark:bg-grid-slate-700/20" />

      {/* Chat Header */}
      <div className="sticky top-0 z-10 flex items-center gap-4 p-4 border-b border-border/40 bg-background/80 backdrop-blur-md shadow-sm">
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
            <AvatarImage src={targetUser.avatar} alt={targetUser.name} />
            <AvatarFallback>
              {targetUser.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span
            className={cn(
              "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
              targetUser.status === "online"
                ? "bg-green-500"
                : targetUser.status === "busy"
                ? "bg-red-500"
                : "bg-gray-400"
            )}
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold tracking-tight">
            {targetUser.name}
          </span>
          <span className="text-xs text-muted-foreground capitalize font-medium">
            {targetUser.status}
          </span>
        </div>
      </div>

      {/* Message List */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="flex flex-col gap-4 max-w-4xl mx-auto pb-4">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isCurrentUser={msg.senderId === currentUser.id}
              senderName={
                msg.senderId === currentUser.id
                  ? currentUser.name
                  : targetUser.name
              }
              senderAvatar={
                msg.senderId === currentUser.id
                  ? currentUser.avatar
                  : targetUser.avatar
              }
            />
          ))}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 bg-transparent">
        <div className="flex w-full items-end gap-2 max-w-4xl mx-auto bg-background/80 backdrop-blur-md p-2 rounded-3xl border border-border/50 shadow-lg ring-1 ring-black/5 dark:ring-white/10">
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
