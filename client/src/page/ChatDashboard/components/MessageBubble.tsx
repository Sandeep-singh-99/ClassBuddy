import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCheck } from "lucide-react";

export interface Message {
  id: string;
  content: string;
  timestamp: string | Date;
  status?: string;
  senderId?: string;
  receiverId?: string;
}

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
  const formattedTime = (() => {
    try {
      const d = new Date(message.timestamp);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  })();

  if (isCurrentUser) {
    return (
      <div className="flex w-full justify-end my-1 group animate-in fade-in duration-200">
        <div className="max-w-[85%] sm:max-w-[70%] md:max-w-[60%] flex flex-col items-end">
          <div className="relative px-3.5 py-2 text-sm shadow-xs rounded-2xl rounded-tr-xs bg-primary text-primary-foreground transition-all">
            <p className="leading-relaxed whitespace-pre-wrap break-words select-text">
              {message.content}
            </p>
            <div className="flex items-center justify-end gap-1 mt-1 select-none">
              <span className="text-[10px] text-primary-foreground/75 font-medium tracking-tight">
                {formattedTime}
              </span>
              <CheckCheck className="h-3.5 w-3.5 text-primary-foreground/90 shrink-0" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-start items-end gap-2 my-1 group animate-in fade-in duration-200">
      <Avatar className="h-7 w-7 rounded-full shrink-0 mb-0.5 border border-border/50 shadow-xs">
        <AvatarImage src={senderAvatar} alt={senderName} />
        <AvatarFallback className="text-[10px] font-bold bg-muted text-muted-foreground">
          {senderName?.slice(0, 2).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      <div className="max-w-[85%] sm:max-w-[70%] md:max-w-[60%] flex flex-col items-start">
        <div className="relative px-3.5 py-2 text-sm shadow-xs rounded-2xl rounded-tl-xs bg-card text-card-foreground border border-border/60 dark:bg-muted/70 transition-all">
          {senderName && (
            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-0.5 tracking-tight select-none">
              {senderName}
            </p>
          )}
          <p className="leading-relaxed whitespace-pre-wrap break-words text-foreground select-text">
            {message.content}
          </p>
          <div className="flex items-center justify-end mt-1 select-none">
            <span className="text-[10px] text-muted-foreground font-medium tracking-tight">
              {formattedTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
