import { useAppSelector } from "@/hooks/hooks";

export default function DocsById() {
    const { docs } = useAppSelector((state) => state.docs);

  return (
    <div className="flex h-screen mt-16">
        <iframe
            src={docs[0]?.file_url}
            title="Document Viewer"
            className="w-full h-full border-none"
        ></iframe>
    </div>
  )
}
