import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAppDispatch } from "@/hooks/hooks";
import { DeleteAssignment } from "@/redux/slice/assignmentSlice";
import { Trash2 } from "lucide-react";
import type React from "react";
import { toast } from "react-toastify";

export default function AssignmentDelete({ id }: { id: string }) {
  const dispatch = useAppDispatch();

  const handleDelete = async () => {
    try {
      const response = await dispatch(DeleteAssignment(id));
      if (response.meta.requestStatus === "fulfilled") {
        toast.success("Assignment deleted successfully");
      }
    } catch (error) {
      toast.error("Failed to delete assignment");
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClick}
          className="cursor-pointer"
        >
          <Trash2 className="w-5 h-5 text-red-600" />
        </Button>
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <div>Are you sure you want to delete this assignment?</div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="default"
            className="cursor-pointer"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
