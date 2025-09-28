import { Card, CardContent } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { DocsStudentFetch } from "@/redux/slice/docsSlice";
import { AlertCircle, ArrowRight, File, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function DocView() {
  const dispatch = useAppDispatch();

  const { docs, error, loading } = useAppSelector((state) => state.docs);

  useEffect(() => {
    dispatch(DocsStudentFetch());
  }, [dispatch]);
  return (
    <div>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <File className="w-8 h-8 text-blue-600" /> Documents
        </h1>

        {loading && (
          <div className="flex items-center justify-center h-screen gap-2 text-gray-500 mb-4">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading notes...
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-500 mb-4">
            <AlertCircle className="w-5 h-5" /> Error: {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {docs.map((doc) => (
            <Card
              key={doc.id}
              className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col justify-between"
            >
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <File className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-semibold">
                    {doc.filename || "Untitled Document"}
                  </h2>
                </div>
                <p className="text-gray-600 text-sm line-clamp-3">
                  Click on this card to view the full content of the note.
                </p>
                <Link
                  to={`/docs/${doc.id}`}
                  className="mt-2 text-xs text-blue-500 font-medium flex items-center gap-1"
                >
                  Click to view <ArrowRight className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
