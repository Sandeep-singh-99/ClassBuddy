import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { DocsFetchById } from "@/redux/slice/docsSlice";
import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";

export default function DocsById() {
    const { docId } = useParams<{ docId: string }>();
    const dispatch = useAppDispatch();
    const { currentDoc, loading, error } = useAppSelector((state) => state.docs);
    const [searchParams] = useSearchParams();
    const requestedPage = Number(searchParams.get("page") ?? 1);
    const page = Number.isInteger(requestedPage) && requestedPage > 0 && requestedPage <= 100 ? requestedPage : 1;
    const document = currentDoc?.id === docId ? currentDoc : null;
    const source = document ? `${document.file_url.split("#")[0]}#page=${page}` : undefined;

    useEffect(() => {
        if (docId) {
            dispatch(DocsFetchById(docId));
        }
    }, [docId, dispatch]);

  if (error) return <p role="alert" className="mx-auto mt-24 max-w-xl p-6 text-center text-sm">Unable to open this document. Check your classroom access and try again.</p>;
  if (loading || !document) return <p role="status" className="mt-24 p-6 text-center">Loading document…</p>;

  return (
    <div className="mt-16 flex h-[calc(100dvh-4rem)] flex-col">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-background p-4 text-sm">
            <p className="font-medium">{document.filename} · Page {page}</p>
            <a href={source} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">Open original document<span className="sr-only"> in a new tab</span></a>
        </div>
        <iframe
            src={source}
            title={`${document.filename}, page ${page}`}
            className="min-h-0 w-full flex-1 border-none"
        ></iframe>
    </div>
  )
}
