import {
  BookOpenText,
  File,
  LayoutDashboard,
  NotebookTabs,
  NotepadTextDashed,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";

export const TSideBar = ({
  setIsOpen,
}: {
  setIsOpen: (open: boolean) => void;
}) => {
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
        <Link to={"/t-dashboard/home"}>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setIsOpen(false)}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Overview
          </Button>
        </Link>

        <Link to={"/t-dashboard/create-notes"}>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setIsOpen(false)}
          >
            <NotebookTabs className="mr-2 h-4 w-4" />
            create Notes
          </Button>
        </Link>

        <Link to={"/t-dashboard/view-notes"}>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setIsOpen(false)}
          >
            <NotepadTextDashed className="mr-2 h-4 w-4" />
            View Notes
          </Button>
        </Link>

        <Link to={"/t-dashboard/docs"}>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setIsOpen(false)}
          >
            <File className="mr-2 h-4 w-4" />
            Docs
          </Button>
        </Link>

        <Link to={"/t-dashboard/assignments"}>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setIsOpen(false)}
          >
            <BookOpenText className="mr-2 h-4 w-4" />
            Assignments
          </Button>
        </Link>
      </nav>
    </div>
  );
};
