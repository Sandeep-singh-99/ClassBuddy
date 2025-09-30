import { Card, CardContent } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { DocsStudentFetch } from "@/redux/slice/docsSlice";
import { AlertCircle, File } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarLoader } from "react-spinners";
export default function DocView() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { docs, error, loading } = useAppSelector((state) => state.docs);

  useEffect(() => {
    dispatch(DocsStudentFetch());
  }, [dispatch]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <File className="w-7 h-7 text-blue-600" /> Documents
      </h1>

      {loading && (
        <BarLoader width={"100%"} color="gray" className="my-4" />
      )}

      {error && (
        <div className="flex items-center justify-center gap-2 p-4 mb-6 bg-red-50 text-red-600 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Error: {error}</span>
        </div>
      )}

      {!loading && !error && docs.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <File className="w-12 h-12 mb-3 text-gray-400" />
          <p className="text-lg font-medium">No documents found</p>
          <p className="text-sm text-gray-400">
            Once documents are uploaded, they will appear here.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {docs.map((doc) => (
          <Card
            key={doc.id}
            className=" border border-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:border-blue-600 transition-all duration-200 cursor-pointer group"
            onClick={() => navigate(`/docs/${doc.id}`)}
          >
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <File className="w-5 h-5 text-blue-500 group-hover:text-blue-600 transition-colors" />
                <h2 className="text-lg font-semibold text-gray-100 group-hover:text-blue-500 transition-colors flex-1 line-clamp-1">
                  {doc.filename || "Untitled Document"}
                </h2>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <img
                  src={doc.owner.image_url}
                  alt={doc.owner.full_name}
                  className="w-8 h-8 rounded-full object-cover border"
                />
                <div>
                  <p className="text-sm font-medium text-gray-200">
                    {doc.owner.full_name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
