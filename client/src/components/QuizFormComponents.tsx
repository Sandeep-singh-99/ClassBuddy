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
import { useNavigate } from "react-router-dom";

export default function QuizFormComponents() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted");
    navigate("/dashboard-panel/mock");
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Start New Quiz</Button>
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
                placeholder="Enter quiz title..."
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="username-1">Description</Label>
              <Input
                id="username-1"
                name="description"
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
