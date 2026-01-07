import { useAppSelector } from "@/hooks/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, User } from "lucide-react";

export default function ProfileCard() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <Card className="w-full max-w-md mx-auto bg-card border-border text-card-foreground shadow-sm">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user?.image_url} alt={user?.full_name} />
          <AvatarFallback className="bg-muted text-foreground">
            user?.full_name
          </AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-xl">{user?.full_name}</CardTitle>
          <Badge
            variant="secondary"
            className="mt-2 bg-secondary text-secondary-foreground capitalize"
          >
            {user?.role}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <span className="text-muted-foreground">{user?.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-muted-foreground" />
          <span className="text-muted-foreground">ID: {user?.id}</span>
        </div>
      </CardContent>
    </Card>
  );
}
