import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { GenerateDashboardData } from "@/redux/slice/dashboardSlice";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useState } from "react";
import { toast } from "sonner";

interface GenerateDashboardBtnProps {
  onGenerated?: (industry: string) => void;
}

export default function GenerateDashboardBtn({ onGenerated }: GenerateDashboardBtnProps) {
  const [industry, setIndustry] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.dashboard);

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanIndustry = industry.trim();
    if (!cleanIndustry) {
      toast.error("Please enter an industry or field");
      return;
    }
    try {
      const res = await dispatch(GenerateDashboardData({ industry: cleanIndustry }));
      if (GenerateDashboardData.fulfilled.match(res)) {
        toast.success(`Generated AI insights for "${cleanIndustry}"!`);
        if (onGenerated) {
          onGenerated(cleanIndustry);
        }
        setOpen(false);
        setIndustry("");
      } else {
        toast.error(`Error: ${res.payload || "Failed to generate dashboard"}`);
      }
    } catch (error) {
      toast.error("Failed to generate career dashboard");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"destructive"} className="cursor-pointer gap-2 shadow-sm hover:shadow-md transition-all">
          <Sparkles className="h-4 w-4" />
          Generate Career Insight
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            Generate Industry Insights
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleGenerate}>
          <div className="space-y-3 py-2">
            <Label htmlFor="industry" className="text-sm font-semibold">
              Enter any Industry or Field
            </Label>
            <Input
              id="industry"
              type="text"
              placeholder="e.g., Software Development, Data Science, AI Engineer"
              className="mt-1"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Our AI agent will research current market trends, salary distributions, demand levels, and required skills for your field.
            </p>
          </div>
          <DialogFooter className="mt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={loading || !industry.trim()}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Response
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

