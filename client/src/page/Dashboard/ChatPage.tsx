import { useState, useRef, type FormEvent } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Paperclip, Send } from "lucide-react";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      name: "Grok",
      text: "Welcome! I'm Grok, created by xAI. How can I help you today?",
      avatar: "/grok-avatar.png", // Replace with xAI logo or Grok-specific avatar
      fromUser: false,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const newUserMessage = {
      id: messages.length + 1,
      name: "User",
      text: input,
      avatar: "",
      fromUser: true,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response (replace with xAI API call)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          name: "Grok",
          text: "Got your message! Here's a placeholder response. Integrate with xAI API for real replies.",
          avatar: "/grok-avatar.png",
          fromUser: false,
          timestamp: new Date().toISOString(),
        },
      ]);
      setIsTyping(false);
    }, 1000);

    // Scroll to bottom
    scrollAreaRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }

  function handleFileClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          name: "User",
          text: `Uploaded file: ${file.name}`,
          avatar: "",
          fromUser: true,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#1A1A1A] text-white">
      {/* Chat Area */}
      <Card className="flex-1 max-w-4xl mx-auto border-[#2A2A2A] bg-[#1A1A1A] rounded-xl shadow-lg overflow-hidden">
        <ScrollArea className="flex-1 p-6 space-y-4 pb-24">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 items-start ${
                msg.fromUser ? "justify-end" : "justify-start"
              }`}
            >
              {!msg.fromUser && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={msg.avatar} alt="Grok avatar" />
                  <AvatarFallback className="bg-[#2F2F2F] text-white">
                    G
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[70%] rounded-2xl p-4 text-sm shadow-sm ${
                  msg.fromUser
                    ? "bg-[#2A2A2A] text-white rounded-br-none"
                    : "bg-[#2F2F2F] text-white rounded-bl-none"
                }`}
              >
                <div className="font-medium text-xs text-gray-400 mb-1">
                  {msg.name}
                </div>
                <div>{msg.text}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              {msg.fromUser && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-[#2F2F2F] text-white">
                    U
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src="/grok-avatar.png" alt="Grok avatar" />
                <AvatarFallback className="bg-[#2F2F2F] text-white">
                  G
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-1">
                <span className="animate-pulse w-2 h-2 bg-gray-400 rounded-full"></span>
                <span className="animate-pulse w-2 h-2 bg-gray-400 rounded-full delay-100"></span>
                <span className="animate-pulse w-2 h-2 bg-gray-400 rounded-full delay-200"></span>
              </div>
            </div>
          )}
          <div className="h-4" ref={scrollAreaRef} />
        </ScrollArea>
      </Card>

      {/* Floating Input Form */}
      <form
        onSubmit={handleSend}
        className="fixed bottom-0 left-0 right-0 bg-[#222222] border-t border-[#2A2A2A] py-4 px-4 shadow-lg z-10"
      >
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button
            type="button"
            onClick={handleFileClick}
            variant="ghost"
            className="p-2 rounded-full hover:bg-[#3A3A3A] transition-colors"
            aria-label="Attach file"
          >
            <Paperclip className="w-5 h-5 text-gray-300" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            aria-hidden="true"
          />
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            autoComplete="off"
            className="flex-1 bg-[#2F2F2F] border-none text-white placeholder-gray-400 rounded-full px-4 py-2 focus:ring-2 focus:ring-[#4A4A4A] focus:outline-none"
          />
          <Button
            type="submit"
            variant="ghost"
            className="p-2 bg-[#3A3A3A] hover:bg-[#4A4A4A] rounded-full text-white"
            aria-label="Send message"
            disabled={!input.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}