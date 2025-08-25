import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAppDispatch } from "@/hooks/hooks";
import { logout } from "@/redux/slice/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Profile() {
  const user = {
    name: "John Doe",
    email: "johndoe@example.com",
    image: "https://i.pravatar.cc/150?img=3",
  };

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout()).then(() => {
      toast.success("Logged out successfully");
    })
    navigate("/");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
      <Card className="w-full max-w-sm shadow-lg rounded-2xl">
        <CardHeader className="flex flex-col items-center">
          <Avatar className="w-20 h-20 mb-3">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-xl font-semibold">{user.name}</CardTitle>
          <p className="text-gray-500 text-sm">{user.email}</p>
        </CardHeader>

        <CardContent className="flex justify-center mt-4">
          <Button 
            variant="destructive" 
            className="flex items-center gap-2" 
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
