import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { DocsFetchById } from "@/redux/slice/docsSlice";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

export default function DocsById() {
    const { docId } = useParams<{ docId: string }>();
    const dispatch = useAppDispatch();
    const { currentDoc } = useAppSelector((state) => state.docs);

    useEffect(() => {
        if (docId) {
            dispatch(DocsFetchById(docId));
        }
    }, [docId, dispatch]);

  return (
    <div className="flex h-screen mt-16">
        <iframe
            src={currentDoc?.file_url}
            title="Document Viewer"
            className="w-full h-full border-none"
        ></iframe>
    </div>
  )
}
