import { PlusCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";

export default function GenerateDashboardBtn() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"destructive"} className="cursor-pointer">
          <PlusCircle className="h-4 w-4" />
          Generate Career Dashboard
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">
            Generate Career Dashboard
          </h2>
          <p>This feature is under development. Please check back later!</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
