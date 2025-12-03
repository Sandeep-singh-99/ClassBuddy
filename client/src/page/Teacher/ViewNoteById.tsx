import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { teachersGetNoteById } from "@/redux/slice/noteSlice";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { CircleAlert } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";
import { BarLoader } from "react-spinners";

export default function ViewNoteById() {
  const { noteId } = useParams<{ noteId: string }>();
  const dispatch = useAppDispatch();
  const { loading, error, currentNote } = useAppSelector(
    (state) => state.notes
  );

  useEffect(() => {
    if (noteId) {
      dispatch(teachersGetNoteById(noteId));
    }
  }, [dispatch, noteId]);

  return (
    <div className="max-w-6xl mx-auto py-20">
      {loading && <BarLoader width={"100%"} color="gray" className="my-4" />}

      {error && (
        <div className="flex items-center gap-2 text-red-500">
          <CircleAlert className="w-5 h-5" /> Error: {error}
        </div>
      )}

      {currentNote && (
        <Card className="shadow-md">
          <CardContent>
            <div data-color-mode="light">
              <MDEditor.Markdown
                source={currentNote.content}
                className="min-h-[400px] p-2"
                style={{ backgroundColor: "transparent" }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !currentNote && !error && (
        <p className="text-gray-500 text-center mt-6">No note found.</p>
      )}
    </div>
  );
}
