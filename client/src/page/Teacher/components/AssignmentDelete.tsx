import { toast } from "sonner";
import { useAppDispatch } from "@/hooks/hooks";
import { DeleteAssignment } from "@/redux/slice/assignmentSlice";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";

export default function AssignmentDelete({ id }: { id: string }) {
  const dispatch = useAppDispatch();

  const handleDelete = async () => {
    try {
      const response = await dispatch(DeleteAssignment(id));
      if (response.meta.requestStatus === "fulfilled") {
        toast.success("Assignment deleted successfully");
      } else {
        toast.error("Failed to delete assignment");
        throw new Error("Failed to delete assignment");
      }
    } catch (error) {
      toast.error("Failed to delete assignment");
      throw error;
    }
  };

  return (
    <ConfirmDeleteDialog
      title="Delete Assignment?"
      description="Are you sure you want to delete this assignment? All associated student submissions and records will be permanently removed."
      confirmText="Delete"
      triggerTooltip="Delete Assignment"
      onConfirm={handleDelete}
    />
  );
}
