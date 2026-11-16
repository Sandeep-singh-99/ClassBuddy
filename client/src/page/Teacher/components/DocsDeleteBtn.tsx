import { toast } from "sonner";
import { useAppDispatch } from "@/hooks/hooks";
import { DocsDelete } from "@/redux/slice/docsSlice";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";

export default function DocsDeleteBtn({ docId }: { docId: string }) {
  const dispatch = useAppDispatch();

  const handleDelete = async () => {
    try {
      await dispatch(DocsDelete(docId)).unwrap();
      toast.success("Document deleted successfully");
    } catch (error: any) {
      toast.error(error || "Failed to delete document");
      throw error;
    }
  };

  return (
    <ConfirmDeleteDialog
      title="Delete Document?"
      description="Are you sure you want to delete this document? This action cannot be undone and students will no longer be able to access it."
      confirmText="Delete Document"
      triggerTooltip="Delete Document"
      onConfirm={handleDelete}
    />
  );
}
