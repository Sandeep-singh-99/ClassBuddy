import { useAppDispatch, useAppSelector } from "@/hooks/hooks";

import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, FileText, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { studentJoinGroupNote } from "@/redux/slice/noteSlice";
import { BarLoader } from "react-spinners";

export default function Notes() {
  const { notes, loading, error } = useAppSelector((state) => state.notes);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(studentJoinGroupNote());
  }, [dispatch]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <FileText className="w-8 h-8 text-blue-600" /> Teacher Notes
      </h1>

      {/* Loading */}
      {loading && (
        <BarLoader width={"100%"} color="gray" className="my-4" />
      )}

      {/* Error */}

      {error && (
        <div className="flex items-center justify-center gap-2 p-4 mb-6 bg-red-50 text-red-600 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Error: {error}</span>
        </div>
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
