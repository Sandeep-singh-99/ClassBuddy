import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Sparkles,
  Plus,
  BrainCircuit,
  Target,
  Layers,
  Loader2,
  BookOpen,
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
import { InterviewPrepCreate } from "@/redux/slice/interviewSlice";

const DIFFICULTY_LEVELS = [
  {
    id: "Beginner",
    label: "Beginner",
    icon: "🌱",
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    id: "Intermediate",
    label: "Intermediate",
    icon: "⚡",
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
  {
    id: "Advanced",
    label: "Advanced",
    icon: "🔥",
    color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
  },
];

export default function QuizFormComponents() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please provide a title for the quiz.");
      return;
    }

    setLoading(true);

    try {
      // Include difficulty in description if appropriate
      const fullDescription = description.trim()
        ? `[Difficulty: ${difficulty}] ${description.trim()}`
        : `[Difficulty: ${difficulty}] Practice quiz for ${title.trim()}`;

      const result = await dispatch(
        InterviewPrepCreate({ name: title, description: fullDescription }),
      ).unwrap();

      toast.success("AI Quiz session created successfully!");
      setOpen(false);
      setTitle("");
      setDescription("");
      navigate(`/dashboard-panel/mock/${result.id}`);
    } catch (error: any) {
      toast.error(error || "Failed to create quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md shadow-primary/20 transition-all gap-2 cursor-pointer">
          <Plus className="h-4 w-4" />
          <span>Start New Quiz</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] border-border/80 bg-card text-card-foreground shadow-2xl p-0 overflow-hidden rounded-2xl">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border/60">
          <DialogHeader className="space-y-1 text-left">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <Badge
                variant="outline"
                className="text-xs font-normal border-primary/20 text-primary"
              >
                <Sparkles className="h-3 w-3 mr-1" /> AI Powered
              </Badge>
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground pt-2">
              Generate AI Quiz
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Specify your quiz details and our AI will curate tailored
              questions for you.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title Field */}
          <div className="space-y-2">
            <Label
              htmlFor="quiz-title"
              className="text-sm font-semibold flex items-center gap-1.5 text-foreground"
            >
              <BookOpen className="h-4 w-4 text-primary" /> Quiz Topic / Subject
              Title
            </Label>
            <Input
              id="quiz-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Data Structures, React.js Hooks, System Design"
              required
              className="bg-background/80 border-border text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-primary"
            />
          </div>

          {/* Difficulty Preset Selector */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
              <Layers className="h-4 w-4 text-primary" /> Target Difficulty
              Level
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTY_LEVELS.map((lvl) => (
                <button
                  type="button"
                  key={lvl.id}
                  onClick={() => setDifficulty(lvl.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs font-medium cursor-pointer ${
                    difficulty === lvl.id
                      ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/20 font-bold shadow-xs"
                      : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <span className="text-base mb-1">{lvl.icon}</span>
                  <span>{lvl.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label
              htmlFor="quiz-desc"
              className="text-sm font-semibold flex items-center justify-between text-foreground"
            >
              <span className="flex items-center gap-1.5">
                <Target className="h-4 w-4 text-primary" /> Focus Areas / Notes
              </span>
              <span className="text-xs text-muted-foreground font-normal">
                Optional
              </span>
            </Label>
            <Textarea
              id="quiz-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Focus on memory optimization, async await patterns, or edge cases..."
              rows={3}
              className="bg-background/80 border-border text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-primary resize-none text-sm"
            />
          </div>

          <DialogFooter className="pt-2 gap-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                className="border-border"
              >
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="submit"
              disabled={loading || !title.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 cursor-pointer shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating Quiz...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Quiz</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
