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
import { useAppDispatch } from "@/hooks/hooks";
import { CreateAssignment } from "@/redux/slice/assignmentSlice";
import { useState } from "react";
import { toast } from "react-toastify";

export default function AssignmentForm() {
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.dueDate) {
      toast.error("Please fill in all fields");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("due_date", new Date(formData.dueDate).toISOString());

    try {
        dispatch(CreateAssignment(formDataToSend)).unwrap().then(() => {
          toast.success("Assignment created successfully");
          setFormData({ title: "", description: "", dueDate: "" });
          setOpen(false);
        }).catch((rejectedValueOrSerializedError) => {
          toast.error(rejectedValueOrSerializedError as string);
        });
    } catch (error) {
        toast.error("Failed to create assignment");
    }
  }

  return (
    <Dialog  open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Create Assignment</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Assignment</DialogTitle>
            <DialogDescription>
              Enter the assignment details below and click create when you're
              ready.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="title">Assignment Title</Label>
              <Input
                id="title"
                name="title"
                type="text"
                className="input"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description">Assignment Description</Label>
              <Textarea
                id="description"
                name="description"
                className="input"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                className="input"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
