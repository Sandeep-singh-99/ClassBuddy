import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAppDispatch } from "@/hooks/hooks";
import { GenerateAssignmentById } from "@/redux/slice/assignmentSlice";
import { toast } from "react-toastify";

export default function GenerateAssignment({ id }: { id: string }) {
  const dispatch = useAppDispatch();

  const handleGenerate = () => {
    try {
      dispatch(GenerateAssignmentById(id));
      toast.success("Assignment generated successfully");
    } catch (error) {
      toast.error("Failed to generate assignment");
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
            <Button variant={"default"} onClick={handleGenerate}>
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
