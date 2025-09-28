import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

export default function DocsDeleteBtn() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="w-5 h-5 text-red-500" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        Are you sure you want to delete this document?
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive">Delete</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
