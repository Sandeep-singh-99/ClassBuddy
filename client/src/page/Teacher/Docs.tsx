import { File } from "lucide-react";
import DocsForm from "./components/DocsForm";


export default function Docs() {
  return (
    <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <File className="w-8 h-8 text-blue-600" /> Documents
        </h1>

        <div className="flex justify-end">
            <DocsForm />
        </div>
    </div>
  )
}
