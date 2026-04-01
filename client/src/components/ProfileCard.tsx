import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, User, Users } from "lucide-react";
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
    <Card className="w-full max-w-md mx-auto bg-card border-border text-card-foreground shadow-sm">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user?.image_url} alt={user?.full_name} />
          <AvatarFallback className="bg-muted text-foreground font-semibold">
            {user?.full_name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-xl font-bold">{user?.full_name}</CardTitle>
          <Badge
            variant="secondary"
            className="mt-2 bg-secondary/80 text-secondary-foreground capitalize font-bold tracking-wide"
          >
            {user?.role}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">{user?.email}</span>
        </div>
        <div className="flex items-center gap-3">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">ID: <span className="font-mono text-xs ml-1 bg-muted/50 px-2 py-0.5 rounded">{user?.id}</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Groups Joined: <span className="text-foreground font-bold ml-1">{groups?.length || 0}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
