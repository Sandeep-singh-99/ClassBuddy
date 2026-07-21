import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";

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
import { useAppDispatch } from "@/hooks/hooks";
import { DocsDelete } from "@/redux/slice/docsSlice";

export default function DocsDeleteBtn({ docId }: { docId: string }) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await dispatch(DocsDelete(docId)).unwrap();
      toast.success("Document deleted successfully");
      setOpen(false);
    } catch (error: any) {
      toast.error(error || "Failed to delete document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-colors"
          onClick={(e) => e.stopPropagation()}
          title="Delete Document"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px] border-border/80 bg-card text-card-foreground shadow-xl rounded-2xl">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-rose-500/10 text-rose-500 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              Delete Document?
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-sm pt-1">
            Are you sure you want to delete this document? This action cannot be undone and students will no longer be able to access it.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-4 gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" disabled={loading} className="border-border">
              Cancel
            </Button>
          </DialogClose>

          <Button
            onClick={handleDelete}
            disabled={loading}
            variant="destructive"
            className="gap-2 cursor-pointer shadow-md"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            <span>Delete Document</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
