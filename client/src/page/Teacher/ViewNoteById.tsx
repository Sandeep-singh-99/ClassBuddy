import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { teachersGetNoteById } from "@/redux/slice/noteSlice";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CircleAlert } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";
import { useTheme } from "@/components/theme-provider";

export default function ViewNoteById() {
  const { noteId } = useParams<{ noteId: string }>();
  const dispatch = useAppDispatch();
  const { loading, error, currentNote } = useAppSelector(
    (state) => state.notes
  );

  const { theme } = useTheme();

  useEffect(() => {
    if (noteId) {
      dispatch(teachersGetNoteById(noteId));
    }
  }, [dispatch, noteId]);

  return (
    <div className="max-w-6xl mx-auto py-20">
      {loading && (
        <Card className="shadow-md">
          <CardContent className="p-6">
            <Skeleton className="h-8 w-1/3 mb-6" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[95%]" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[85%]" />
            </div>
            <div className="space-y-3 mt-6">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[92%]" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[80%]" />
            </div>
            <div className="space-y-3 mt-6">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[96%]" />
              <Skeleton className="h-4 w-[88%]" />
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-500">
          <CircleAlert className="w-5 h-5" /> Error: {error}
        </div>
      )}

      {currentNote && (
        <Card className="shadow-md">
          <CardContent>
            <div data-color-mode={theme}>
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
