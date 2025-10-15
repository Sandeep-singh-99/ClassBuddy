import {
  BookOpenCheck,
  File,
  GraduationCap,
  LayoutDashboard,
  LayoutGridIcon,
  NotebookTabsIcon,
  Sparkles,
  User2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SideBar = () => {
  return (
    <div className="h-full px-4 py-6">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 px-2">
        <Link to={"/"} className="flex items-center gap-2">
          <Sparkles />
          <span className="text-xl font-bold">Class Buddy</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        <Link to={"/dashboard-panel/home"}>
          <Button
            variant="ghost"
            className="w-full justify-start"
            // onClick={() => setIsOpen(false)}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Overview
          </Button>
        </Link>

        <Link to={"/dashboard-panel/view-teachers"}>
          <Button
            variant="ghost"
            className="w-full justify-start"
            // onClick={() => setIsOpen(false)}
          >
            <User2 className="mr-2 h-4 w-4" />
            All Teachers
          </Button>
        </Link>

        <Link to={"/dashboard-panel/notes"}>
          <Button
            variant="ghost"
            className="w-full justify-start"
            // onClick={() => setIsOpen(false)}
          >
            <NotebookTabsIcon className="mr-2 h-4 w-4" />
            Notes
          </Button>
        </Link>

        <Link to={"/dashboard-panel/docs"}>
          <Button
            variant="ghost"
            className="w-full justify-start"
            // onClick={() => setIsOpen(false)}
          >
            <File className="mr-2 h-4 w-4" />
            Docs
          </Button>
        </Link>

        <Link to={"/dashboard-panel/interview-prep"}>
          <Button
            variant="ghost"
            className="w-full justify-start"
            // onClick={() => setIsOpen(false)}
          >
            <GraduationCap className="mr-2 h-4 w-4" />
            Interview Preparation
          </Button>
        </Link>

        <Link to={"/dashboard-panel/dashboard"}>
          <Button
            variant="ghost"
            className="w-full justify-start"
            // onClick={() => setIsOpen(false)}
          >
            <LayoutGridIcon className="mr-2 h-4 w-4" />
            Career Insights
          </Button>
        </Link>

        <Link to={"/dashboard-panel/assignments"}>
          <Button
            variant="ghost"
            className="w-full justify-start"
            // onClick={() => setIsOpen(false)}
          >
            <BookOpenCheck className="mr-2 h-4 w-4" />
            Assignments
          </Button>
        </Link>
      </nav>
    </div>
  );
};

export default SideBar;
