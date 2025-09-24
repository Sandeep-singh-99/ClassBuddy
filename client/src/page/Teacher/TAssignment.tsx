import { BookOpenText } from "lucide-react";
import AssignmentForm from "./components/AssignmentForm";


export default function TAssignment() {
  return (
    <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <BookOpenText className="w-8 h-8 text-blue-600" /> Assignment 
        </h1>

        <div className="flex justify-end">
            <AssignmentForm />
        </div>
    </div>
  )
}
