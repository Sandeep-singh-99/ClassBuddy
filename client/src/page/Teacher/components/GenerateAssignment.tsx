import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, BrainCircuit, Loader2 } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { useAppDispatch } from "@/hooks/hooks";
import { fetchAssignmentById, GenerateAssignmentById } from "@/redux/slice/assignmentSlice";

export default function GenerateAssignment({ id }: { id: string }) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(GenerateAssignmentById(id)).unwrap();
      toast.success("AI Assignment questions generated successfully!");
      await dispatch(fetchAssignmentById(id)).unwrap();
      setOpen(false);
    } catch (error: any) {
      toast.error(error || "Failed to generate assignment questions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md shadow-primary/20 gap-2 cursor-pointer">
          <Sparkles className="h-4 w-4" />
          <span>Generate AI Questions</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[450px] border-border/80 bg-card text-card-foreground shadow-xl rounded-2xl">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <Badge variant="outline" className="text-xs font-normal border-primary/20 text-primary">
              <Sparkles className="h-3 w-3 mr-1" /> AI Generation
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold text-foreground pt-1">
            Generate AI Questions?
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Our AI engine will analyze the assignment topic and automatically craft relevant coding and technical questions for your students.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <DialogClose asChild>
            <Button variant="outline" disabled={loading} className="border-border">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 cursor-pointer shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Questions</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
