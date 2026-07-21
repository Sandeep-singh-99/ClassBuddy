import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAppDispatch } from "@/hooks/hooks";
import { DeleteAssignment } from "@/redux/slice/assignmentSlice";

export default function AssignmentDelete({ id }: { id: string }) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      const response = await dispatch(DeleteAssignment(id));
      if (response.meta.requestStatus === "fulfilled") {
        toast.success("Assignment deleted successfully");
        setOpen(false);
      }
    } catch (error) {
      toast.error("Failed to delete assignment");
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClick}
          className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-colors"
          title="Delete Assignment"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent
        onClick={(e) => e.stopPropagation()}
        className="sm:max-w-[420px] border-border/80 bg-card text-card-foreground shadow-xl rounded-2xl"
      >
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-rose-500/10 text-rose-500 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              Delete Assignment?
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-sm pt-1">
            Are you sure you want to delete this assignment? All associated student submissions and records will be permanently removed.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-4 gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" disabled={loading} className="border-border">
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="gap-2 cursor-pointer shadow-md"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            <span>Delete</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
