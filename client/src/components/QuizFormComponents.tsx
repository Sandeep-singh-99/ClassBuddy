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
import { useAppDispatch } from "@/hooks/hooks";
import { InterviewPrepCreate } from "@/redux/slice/interviewSlice";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function QuizFormComponents() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const dispatch = useAppDispatch();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    try {
       await dispatch(InterviewPrepCreate({ name: title, description })).unwrap();
        toast.success("Quiz created successfully!");
         navigate("/dashboard-panel/mock");
    } catch (error) {
      toast.error("Failed to create quiz. Please try again.");
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Start New Quiz</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Quiz</DialogTitle>
            <DialogDescription>
              Enter the quiz details below and click start when you're ready.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Title</Label>
              <Input
                id="name-1"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Enter quiz title..."
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="username-1">Description</Label>
              <Input
                id="username-1"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Enter your description..."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Start Quiz</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
