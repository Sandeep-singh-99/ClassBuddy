import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/hooks/hooks";
import { deleteNoteById, teacherNotes } from "@/redux/slice/noteSlice";
import { toast } from "react-toastify";

export default function DeleteBtn({ noteId }: { noteId: string }) {
  const dispatch = useAppDispatch();

  const handleDelete = async () => {
    try {
      const response = await dispatch(deleteNoteById(noteId));
      if (response.meta.requestStatus === "fulfilled") {
        toast.success("Note deleted successfully");
        dispatch(teacherNotes());
      }
    } catch (error) {
      toast.error("Failed to delete note");
    }
  };

  return (
    <div>
      <Button variant={"outline"} size={"sm"} onClick={handleDelete}>
        Delete
      </Button>
    </div>
  );
}
