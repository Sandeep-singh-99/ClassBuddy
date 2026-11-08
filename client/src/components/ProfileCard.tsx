import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Users } from "lucide-react";
import { fetchGroups } from "@/redux/slice/chatSlice";

export default function ProfileCard() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { groups } = useAppSelector((state) => state.chat);

  // Fetch groups to display the total joined count accurately
  useEffect(() => {
    if (user && groups.length === 0) {
      dispatch(fetchGroups());
    }
  }, [dispatch, user, groups.length]);

  return (
    <div className="w-full sm:min-w-[280px] md:min-w-[320px] rounded-2xl border border-border/60 bg-card/90 backdrop-blur-md p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3.5">
        <Avatar className="h-12 w-12 border-2 border-primary/20 shrink-0 shadow-xs">
          <AvatarImage src={user?.image_url} alt={user?.full_name} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
            {user?.full_name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-foreground truncate leading-tight">
              {user?.full_name || "Student"}
            </h3>
            <Badge
              variant="secondary"
              className="text-[10px] font-semibold px-2 py-0.5 capitalize shrink-0 bg-primary/10 text-primary border border-primary/20"
            >
              {user?.role || "Student"}
            </Badge>
          </div>

          {user?.email && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 truncate">
              <Mail className="h-3 w-3 text-muted-foreground/70 shrink-0" />
              <span className="truncate">{user.email}</span>
            </p>
          )}

          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
            <Users className="h-3 w-3 text-primary shrink-0" />
            <span>
              Groups Joined:{" "}
              <span className="font-bold text-foreground">
                {groups?.length || 0}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
