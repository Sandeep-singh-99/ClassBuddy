import MDEditor from "@uiw/react-md-editor";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Code, FileText } from "lucide-react";
import { useTheme } from "next-themes";

interface AQuestionsProps {
  questions: any[];
}

export default function AQuestions({ questions }: AQuestionsProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (!questions || !questions.length) {
    return (
      <CardContent className="p-6 text-center text-muted-foreground text-sm">
        No questions generated for this assignment yet.
      </CardContent>
    );
  }

  return (
    <CardContent className="p-6 pt-2 space-y-4">
      <Accordion type="single" collapsible className="space-y-3">
        {questions.map((question, index) => {
          const isCoding = question.type === "coding";

          return (
            <AccordionItem
              key={index}
              value={`question-${index}`}
              className="border border-border/60 rounded-xl bg-background/60 overflow-hidden shadow-xs"
            >
              <AccordionTrigger className="flex justify-between items-center px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted/40 rounded-xl transition-all">
                <div className="flex items-center gap-2 text-left">
                  <Badge
                    variant="outline"
                    className={`px-2.5 py-0.5 text-[10px] font-bold uppercase gap-1 ${
                      isCoding
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                        : "border-primary/30 bg-primary/10 text-primary"
                    }`}
                  >
                    {isCoding ? <Code className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                    {question.type || "Question"}
                  </Badge>
                  <span>Question {index + 1}</span>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-5 py-4 border-t border-border/40 bg-card/40">
                <div
                  data-color-mode={isDark ? "dark" : "light"}
                  className="p-4 rounded-xl border border-border/40 bg-background/80"
                >
                  <MDEditor.Markdown
                    source={question.question || question.text || ""}
                    className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-foreground"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </CardContent>
  );
}
