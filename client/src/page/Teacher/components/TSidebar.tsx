import { useState } from "react";
import {
  BookOpenText,
  LayoutDashboard,
  NotebookTabs,
  NotepadTextDashed,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../../../components/ui/sheet";
import { Button } from "../../../components/ui/button";

const TSideBar = () => {
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

export default TSideBar;

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
        <Link to={"/t-dashboard/home"}>
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
        <Link to={"/t-dashboard/create-notes"}>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={closeSheet}
          >
            <NotebookTabs className="mr-2 h-4 w-4" />
            Create Notes
          </Button>
        </Link>


        <Link to={"/t-dashboard/view-notes"}>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={closeSheet}
          >
            <NotepadTextDashed className="mr-2 h-4 w-4" />
            View Notes
          </Button>
        </Link>

        <Link to={"/t-dashboard/assignments"}>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={closeSheet}
          >
            <BookOpenText className="mr-2 h-4 w-4" />
            Assignments
          </Button>
        </Link>

        
        {/* <FeedbackFormComponents /> */}
      </nav>
    </div>
  );
}