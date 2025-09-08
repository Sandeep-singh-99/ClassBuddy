import { useState } from "react";
import {
  Hash,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="md:hidden m-4">
            <LayoutDashboard className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[250px]">
          <DashboardSidebar closeSheet={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="hidden md:block h-screen w-[250px] border-r bg-background">
        <DashboardSidebar />
      </div>
    </div>
  );
};

export default SideBar;

function DashboardSidebar({ closeSheet }: { closeSheet?: () => void }) {
  return (
    <div className="h-full px-4 py-6">
      <div className="flex items-center gap-2 mb-8 px-2">
        <Link to={"/"} className="flex items-center gap-2">
          <Sparkles />
          <span className="text-xl font-bold">Class Buddy</span>
        </Link>
      </div>
      <nav className="space-y-1">
        

        {/* Article Link */}
        <Link to={"/dashboard-panel/home"}>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={closeSheet}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Overview
          </Button>
        </Link>

        {/* Blog Link */}
        <Link to={"/dashboard-panel/view-teachers"}>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={closeSheet}
          >
            <Hash className="mr-2 h-4 w-4" />
            All Teachers
          </Button>
        </Link>

        
        {/* <FeedbackFormComponents /> */}
      </nav>
    </div>
  );
}