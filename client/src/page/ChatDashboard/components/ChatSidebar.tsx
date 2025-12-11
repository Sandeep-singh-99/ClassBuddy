import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "../mockData";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  users: User[];
  selectedUserId?: string;
  onSelectUser: (user: User) => void;
}

export function ChatSidebar({
  users,
  selectedUserId,
  onSelectUser,
}: ChatSidebarProps) {
  return (
    <div className="w-full md:w-80 border-r h-full flex flex-col bg-background/50 backdrop-blur-sm">
      <div className="p-6 border-b border-border/40">
        <h2 className="text-2xl font-bold mb-6 tracking-tight">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            className="pl-9 bg-muted/50 border-transparent focus:bg-background focus:border-input transition-all duration-200"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 p-3">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelectUser(user)}
              className={cn(
                "group flex flex-col items-start gap-2 rounded-xl border border-transparent p-3 text-left text-sm transition-all duration-200 hover:bg-accent/50 hover:scale-[1.02]",
                selectedUserId === user.id &&
                  "bg-accent border-border/50 shadow-sm"
              )}
            >
              <div className="flex w-full flex-col gap-1">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {user.status === "online" && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                    )}
                    {user.status === "busy" && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-red-500 border-2 border-background" />
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-semibold truncate">{user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {user.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium tabular-nums">
                    {user.lastMessageTime}
                  </span>
                </div>
                <div className="flex items-center w-full mt-2 pl-1">
                  <p
                    className={cn(
                      "text-xs text-muted-foreground line-clamp-1 w-full",
                      selectedUserId === user.id ? "text-foreground" : ""
                    )}
                  >
                    {user.lastMessage}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
