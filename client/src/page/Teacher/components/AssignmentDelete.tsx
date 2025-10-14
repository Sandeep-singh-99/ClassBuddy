import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash } from "lucide-react";
import type React from "react";

export default function AssignmentDelete() {

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" onClick={handleClick} className="cursor-pointer">
          <Trash className="w-5 h-5 text-red-600" />
        </Button>
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <div>Are you sure you want to delete this assignment?</div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="default" className="cursor-pointer">Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
