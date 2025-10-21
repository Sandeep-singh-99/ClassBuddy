import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAppDispatch } from "@/hooks/hooks";
import { fetchAssignmentById, GenerateAssignmentById } from "@/redux/slice/assignmentSlice";
import { useState } from "react";
import { toast } from "react-toastify";

export default function GenerateAssignment({ id }: { id: string }) {
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await dispatch(GenerateAssignmentById(id)).unwrap();
      toast.success("Assignment generated successfully");
      await dispatch(fetchAssignmentById(id)).unwrap();
      setLoading(false);
    } catch (error) {
      toast.error("Failed to generate assignment");
      setLoading(false);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"destructive"} className="">
          Generate Assignment
        </Button>
      </DialogTrigger>
      <form>
        <DialogContent>
          <div className="text-sm ">
            Do you want to generate assignment questions using AI?
          </div>
          <DialogFooter>
            <DialogClose>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant={"default"} disabled={loading} onClick={handleGenerate}>
              {loading ? "Generating..." : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
