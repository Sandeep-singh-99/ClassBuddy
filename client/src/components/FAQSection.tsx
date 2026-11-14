import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How does ClassBuddy extract formulas and notes from my slides?",
    answer:
      "ClassBuddy leverages vision-enabled LangGraph agents and Gemini 2.5 Flash. It parses PDF equations, tables, slide hierarchies, and lecture audio into structured markdown notes with zero hallucinated fluff.",
  },
  {
    question: "Can educators customize the grading rubric for assignments?",
    answer:
      "Yes. Educators define customized grading rubrics with weighted criteria (e.g. proof correctness, algorithm efficiency, code quality). The AI auto-evaluates submissions line-by-line while leaving 100% override authority with the instructor.",
  },
  {
    question: "How do classroom groups work with 6-character codes?",
    answer:
      "Teachers create a cohort group in 10 seconds. ClassBuddy generates a secure 6-character code (e.g. 'CS101B'). Students enter this code to immediately sync broadcasted notes, study materials, and assignments.",
  },
  {
    question: "Is my coursework, student data, and research content secure?",
    answer:
      "Yes. ClassBuddy enforces RFC 7636 PKCE OAuth 2.0 authorization, encrypted token cookies, and tenant-isolated databases. Your uploaded course documents are never shared or used to train public foundation models.",
  },
  {
    question: "What is included in the Free Starter plan?",
    answer:
      "Individual students can synthesize up to 15 full lecture note decks per month, generate 30 adaptive practice quizzes, and join up to 3 classroom groups with zero time limit and no credit card required.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 sm:py-32 bg-background border-t border-black/[0.08] dark:border-white/[0.08]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-left space-y-3">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
            // FAQ
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-foreground leading-[1.1]">
            Frequently answered questions.
          </h2>
        </div>

        {/* Minimalist Accordion */}
        <div className="divide-y divide-black/[0.08] dark:divide-white/[0.08] border-y border-black/[0.08] dark:border-white/[0.08]">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="py-5">
                <button
                  id={`faq-btn-${index}`}
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  className="w-full flex items-center justify-between text-left cursor-pointer focus:outline-none group"
                >
                  <span
                    className={`text-sm sm:text-base font-semibold transition-colors pr-6 ${
                      isOpen ? "text-primary" : "text-foreground group-hover:text-primary"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${index}`}
                    role="region"
                    aria-labelledby={`faq-btn-${index}`}
                    className="pt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed animate-in fade-in duration-150"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
