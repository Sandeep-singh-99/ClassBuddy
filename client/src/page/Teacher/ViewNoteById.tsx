import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { teachersGetNoteById } from "@/redux/slice/noteSlice";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";

export default function ViewNoteById() {
  const { noteId } = useParams<{ noteId: string }>();
  const dispatch = useAppDispatch();
  const { loading, error, currentNote } = useAppSelector((state) => state.notes);

  useEffect(() => {
    if (noteId) {
      dispatch(teachersGetNoteById(noteId));
    }
  }, [dispatch, noteId]);

  return (
    <div className="max-w-6xl mx-auto py-20">

      {loading && (
        <div className="flex flex-col justify-center h-screen items-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading note...
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="w-5 h-5" /> Error: {error}
        </div>
      )}

      {currentNote && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">{currentNote.title || "Untitled Note"}</CardTitle>
          </CardHeader>
          <CardContent>
            <MDEditor.Markdown source={currentNote.content} className="min-h-[400px] p-2" />
          </CardContent>
        </Card>
      )}

      {!loading && !currentNote && !error && (
        <p className="text-gray-500 text-center mt-6">No note found.</p>
      )}
    </div>
  );
}
