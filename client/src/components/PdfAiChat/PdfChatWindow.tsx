import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Bookmark,
  Copy,
  Check,
  CornerDownLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { ActivePdfInfo } from "./PdfDocumentInfoCard";

export interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  citation?: string;
  isStreaming?: boolean;
}

interface PdfChatWindowProps {
  pdfInfo: ActivePdfInfo;
  messages: Message[];
  isAiTyping: boolean;
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
}

export default function PdfChatWindow({
  pdfInfo,
  messages,
  isAiTyping,
  onSendMessage,
  onClearChat,
}: PdfChatWindowProps) {
  const [inputText, setInputText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAiTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(inputText.trim());
    setInputText("");
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Response copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="border border-border/60 rounded-2xl bg-card flex flex-col h-full shadow-xs overflow-hidden">
      {/* ── 1. Top Header Bar ──────────────────────────────────────────────── */}
      <div className="p-3.5 px-5 border-b border-border/40 bg-muted/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-primary to-violet-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold tracking-tight">
                ClassBuddy AI Assistant
              </h3>
              <Badge variant="secondary" className="text-[9px] font-extrabold px-1.5 py-0 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                GPT-4o Fine-Tuned
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-1">
              Active Context: <span className="font-semibold text-foreground">{pdfInfo.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearChat}
            className="text-xs text-muted-foreground hover:text-destructive h-8 px-2.5 rounded-lg gap-1.5"
            title="Clear Chat History"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </Button>
        </div>
      </div>

      {/* ── 2. Message History Area ────────────────────────────────────────── */}
      <ScrollArea className="flex-1 p-4 sm:p-6" ref={scrollRef}>
        <div className="space-y-6 max-w-3xl mx-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 sm:gap-4 ${
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              } animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              {/* Avatar */}
              <div
                className={`h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs font-bold text-xs ${
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-gradient-to-tr from-indigo-600 via-primary to-violet-600 text-white"
                }`}
              >
                {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Message Content Bubble */}
              <div
                className={`group relative max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 ${
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground font-medium rounded-tr-xs"
                    : "bg-muted/50 dark:bg-accent/40 border border-border/40 text-foreground rounded-tl-xs"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Page Citation Pill (if present) */}
                {msg.citation && (
                  <div className="flex items-center gap-1.5 pt-2 border-t border-border/30 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                    <Bookmark className="h-3 w-3 fill-indigo-500/20" />
                    <span>Reference: {msg.citation}</span>
                  </div>
                )}

                {/* Message Metadata & Copy Action */}
                <div className="flex items-center justify-between text-[10px] opacity-70 pt-1">
                  <span>{msg.timestamp}</span>
                  {msg.sender === "ai" && (
                    <button
                      onClick={() => copyToClipboard(msg.id, msg.text)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-primary cursor-pointer flex items-center gap-1"
                      title="Copy message"
                    >
                      {copiedId === msg.id ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* AI Typing Indicator */}
          {isAiTyping && (
            <div className="flex gap-3 items-center animate-in fade-in duration-200">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-primary to-violet-600 text-white flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="p-3 px-4 rounded-2xl rounded-tl-xs bg-muted/40 border border-border/40 flex items-center gap-2 text-xs text-muted-foreground font-medium">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>AI is reading {pdfInfo.name} and generating answer...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* ── 3. Bottom Input Bar & Prompt Suggestions ──────────────────────── */}
      <div className="p-3 sm:p-4 border-t border-border/40 bg-card space-y-3">
        {/* Starter Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] font-semibold text-muted-foreground shrink-0 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" /> Suggestions:
          </span>
          <button
            onClick={() => onSendMessage("What are the key concepts covered in this PDF?")}
            className="shrink-0 px-2.5 py-1 rounded-full bg-accent/60 hover:bg-primary/10 hover:text-primary border border-border/40 transition-colors text-[11px]"
          >
            💡 Key Concepts
          </button>
          <button
            onClick={() => onSendMessage("Can you summarize page 1-3 for me?")}
            className="shrink-0 px-2.5 py-1 rounded-full bg-accent/60 hover:bg-primary/10 hover:text-primary border border-border/40 transition-colors text-[11px]"
          >
            📝 Summarize Pages 1-3
          </button>
          <button
            onClick={() => onSendMessage("Give me 3 potential exam questions from this text.")}
            className="shrink-0 px-2.5 py-1 rounded-full bg-accent/60 hover:bg-primary/10 hover:text-primary border border-border/40 transition-colors text-[11px]"
          >
            🎯 Exam Questions
          </button>
        </div>

        {/* Textarea / Input Bar */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
          <div className="relative flex-1">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask anything about ${pdfInfo.name}...`}
              className="pr-10 py-6 text-xs sm:text-sm rounded-xl border-border/80 focus-visible:ring-primary shadow-xs"
              disabled={isAiTyping}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-medium text-muted-foreground pointer-events-none">
              <CornerDownLeft className="h-3 w-3" />
            </div>
          </div>

          <Button
            type="submit"
            disabled={!inputText.trim() || isAiTyping}
            className="h-12 w-12 rounded-xl shrink-0 font-bold shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            {isAiTyping ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
