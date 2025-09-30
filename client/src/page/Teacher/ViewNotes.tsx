import { useAppDispatch, useAppSelector } from "@/hooks/hooks";

import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, FileText, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { teacherNotes } from "@/redux/slice/noteSlice";
import { BarLoader } from "react-spinners";

export default function ViewNotes() {
  const { notes, loading, error } = useAppSelector((state) => state.notes);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(teacherNotes());
  }, [dispatch]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <FileText className="w-8 h-8 text-blue-600" /> View Own Notes
      </h1>

      {/* Loading */}
      {loading && (
        // <div className="flex items-center justify-center h-screen gap-2 text-gray-500 mb-4">
        //   <Loader2 className="w-5 h-5 animate-spin" /> Loading notes...
        // </div>
         <BarLoader width={"100%"} color="gray" className="my-4" />
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-500 mb-4">
          <AlertCircle className="w-5 h-5" /> Error: {error}
        </div>
      )}

      {/* Empty */}
      {!loading && notes.length === 0 && (
        <p className="text-gray-500 text-center">No notes found.</p>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <Card
            key={note.id}
            className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col justify-between"
          >
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold">
                  {note.title || "Untitled Note"}
                </h2>
              </div>
              {/* Content Preview / Click Hint */}
              <p className="text-gray-600 text-sm line-clamp-3">
                Click on this card to view the full content of the note.
              </p>

              <Link
                to={`/view-notes/${note.id}`}
                className="mt-2 text-xs text-blue-500 font-medium flex items-center gap-1"
              >
                Click to view <ArrowRight className="w-4 h-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
