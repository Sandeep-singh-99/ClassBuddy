import { useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { fetchGroups, setActiveGroup } from "@/redux/slice/chatSlice";
import type { Group } from "@/redux/slice/chatSlice";
import { Link, useNavigate } from "react-router-dom";

export function ChatSidebar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { groups, activeGroup, loading } = useAppSelector(
    (state) => state.chat
  );

  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  const handleSelectGroup = (group: Group) => {
    dispatch(setActiveGroup(group));
    navigate(`chat?groupId=${group.id}`);
  };

  return (
    <div className="w-full md:w-80 border-r h-full flex flex-col bg-background/50 backdrop-blur-sm">
      <div className="p-6 border-b border-border/40">
        <Link to={"/"}>
          <h2 className="text-2xl font-bold mb-6 tracking-tight">
            ClassBuddy Chat
          </h2>
        </Link>
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
          {loading ? (
            <div className="flex items-center justify-center p-4 text-muted-foreground">
              Loading groups...
            </div>
          ) : (
            groups.map((group) => (
              <button
                key={group.id}
                onClick={() => handleSelectGroup(group)}
                className={cn(
                  "group flex flex-col items-start gap-2 rounded-xl border border-transparent p-3 text-left text-sm transition-all duration-200 hover:bg-accent/50 hover:scale-[1.02]",
                  activeGroup?.id === group.id &&
                    "bg-accent border-border/50 shadow-sm"
                )}
              >
                <div className="flex w-full flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                        <AvatarImage
                          src={group.image_url || group.owner?.image_url || ""}
                          alt={group.group_name}
                        />
                        <AvatarFallback>
                          {group.group_name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {/* Status indicators removed as groups don't have online status yet */}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-semibold truncate">
                        {group.group_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {group.owner
                          ? `Owner: ${group.owner.full_name}`
                          : "Group"}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
