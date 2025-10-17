import { PlusCircle } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useAppDispatch } from "@/hooks/hooks";
import { toast } from "react-toastify";
import { GenerateDashboardData } from "@/redux/slice/dashboardSlice";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useState } from "react";

export default function GenerateDashboardBtn() {
  const [industry, setIndustry] = useState<string>("");

  const dispatch = useAppDispatch();

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!industry.trim()) {
        toast.error("Please enter an industry");
        return;
    }
    try {
      const res = await dispatch(GenerateDashboardData({ industry }));
      if (GenerateDashboardData.fulfilled.match(res)) {
        toast.success("Career dashboard generated successfully");
      } else {
        toast.error(`Error: ${res.payload || "Failed to generate dashboard"}`);
      }
    } catch (error) {
      toast.error("Failed to generate career dashboard");
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"destructive"} className="cursor-pointer">
          <PlusCircle className="h-4 w-4" />
          Generate Career Dashboard
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Career Dashboard</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleGenerate}>
          <div className="space-y-2">
            <Label>Industry</Label>
            <Input
              type="text"
              placeholder="e.g., Software Development, Data Science"
              className="mt-1 mb-4"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <Button variant="destructive">
              Generate
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
