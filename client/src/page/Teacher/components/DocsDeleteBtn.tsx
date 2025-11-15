import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useAppDispatch } from "@/hooks/hooks";
import { DocsDelete } from "@/redux/slice/docsSlice";
import { Loader2Icon, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

export default function DocsDeleteBtn({ docId }: { docId: string }) {
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        try {
            setLoading(true);
            await dispatch(DocsDelete(docId));
            toast.success("Document deleted successfully");
        } catch (error) {
            toast.error("Failed to delete document");
        } finally {
            setLoading(false);
        }
    }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="cursor-pointer">
          <Trash2 className="w-5 h-5 text-red-500" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        Are you sure you want to delete this document?
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleDelete} disabled={loading} className="cursor-pointer" variant="destructive">
            {loading && <Loader2Icon className="animate-spin" />}
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
