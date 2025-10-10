import MDEditor from "@uiw/react-md-editor";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { ChevronDown } from "lucide-react";

interface AQuestionsProps {
  questions: any[];
}

export default function AQuestions({ questions }: AQuestionsProps) {
  if (!questions.length) {
    return (
      <CardContent>
        <p className="text-center text-zinc-400 italic">No questions found.</p>
      </CardContent>
    );
  }

  return (
    <CardContent className="space-y-4">
      <Accordion type="single" collapsible className="space-y-2">
        {questions.map((question, index) => (
          <AccordionItem
            key={index}
            value={`question-${index}`}
            className="border border-zinc-700 rounded-xl bg-zinc-900/50"
          >
            <AccordionTrigger className="flex justify-between items-center px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 rounded-xl">
              <span>
                <Badge
                  variant={question.type === "coding" ? "secondary" : "outline"}
                  className="px-2 py-1 text-xs mr-2"
                >
                  {question.type?.toUpperCase()}
                </Badge>
                Question {index + 1}
              </span>
              <ChevronDown className="w-4 h-4" />
            </AccordionTrigger>
            <AccordionContent className="px-4 py-2 border-t border-zinc-700">
              <div
                data-color-mode="dark"
                className="p-2 bg-zinc-950/40 rounded-lg"
              >
                <MDEditor.Markdown
                  source={question.question}
                  className="prose prose-invert max-w-none leading-relaxed"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </CardContent>
  );
}
