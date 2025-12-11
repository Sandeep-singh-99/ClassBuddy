import { cn } from "@/lib/utils";
import type { Message } from "../mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  senderName?: string;
  senderAvatar?: string;
}

export function MessageBubble({
  message,
  isCurrentUser,
  senderName,
  senderAvatar,
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex w-full mt-4 space-x-3 max-w-lg group animate-in fade-in slide-in-from-bottom-2 duration-300",
        isCurrentUser ? "ml-auto justify-end" : ""
      )}
    >
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 mt-1 border border-border shadow-sm">
          <AvatarImage src={senderAvatar} alt={senderName} />
          <AvatarFallback>
            {senderName?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "flex flex-col",
          isCurrentUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "relative px-4 py-3 text-sm shadow-sm transition-all duration-200",
            isCurrentUser
              ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-2xl rounded-tr-sm"
              : "bg-muted/80 backdrop-blur-sm hover:bg-muted text-foreground rounded-2xl rounded-tl-sm border border-border/50"
          )}
        >
          <p className="leading-relaxed">{message.content}</p>
        </div>
        <div className="flex items-center gap-1 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="text-[10px] text-muted-foreground font-medium">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {isCurrentUser && (
            <span className="text-[10px] text-muted-foreground ml-1">
              {message.status === "read" ? "Read" : "Delivered"}
            </span>
          )}
        </div>
      </div>
      {isCurrentUser && (
        <Avatar className="h-8 w-8 mt-1 border border-border shadow-sm">
          <AvatarImage src={senderAvatar} alt={senderName} />
          <AvatarFallback>
            {senderName?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
