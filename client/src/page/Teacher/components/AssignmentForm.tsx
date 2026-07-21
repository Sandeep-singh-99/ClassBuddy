import { useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  BookOpenText,
  Calendar,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch } from "@/hooks/hooks";
import { CreateAssignment } from "@/redux/slice/assignmentSlice";

export default function AssignmentForm() {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.dueDate) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("due_date", new Date(formData.dueDate).toISOString());

    try {
      await dispatch(CreateAssignment(formDataToSend)).unwrap();
      toast.success("Assignment created successfully");
      setFormData({ title: "", description: "", dueDate: "" });
      setOpen(false);
    } catch (rejectedValueOrSerializedError) {
      toast.error((rejectedValueOrSerializedError as string) || "Failed to create assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md shadow-primary/20 transition-all gap-2 cursor-pointer">
          <Plus className="h-4 w-4" />
          <span>Create Assignment</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] border-border/80 bg-card text-card-foreground shadow-2xl p-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border/60">
          <DialogHeader className="space-y-1 text-left">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <BookOpenText className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="text-xs font-normal border-primary/20 text-primary">
                <Sparkles className="h-3 w-3 mr-1" /> Course Assessment
              </Badge>
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground pt-2">
              Create Assignment
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Enter title, instructions, and due date to publish a new assignment for your students.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form className="p-6 space-y-5" onSubmit={handleSubmit}>
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-primary" /> Assignment Title
            </Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. Midterm Coding Challenge: Data Structures"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-background/80 border-border text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-primary h-10"
              required
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <BookOpenText className="h-4 w-4 text-primary" /> Instructions & Description
            </Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Provide assignment guidelines, requirements, or problem statements..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-background/80 border-border text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-primary resize-none text-sm"
              required
            />
          </div>

          {/* Due Date Field */}
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary" /> Submission Due Date
            </Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="bg-background/80 border-border text-foreground focus-visible:ring-primary h-10"
              required
            />
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={loading} className="border-border">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 cursor-pointer shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Create Assignment</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
