import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is ClassBuddy?",
    answer:
      "ClassBuddy is a platform that helps teachers and students collaborate seamlessly. Teachers can create groups, share AI-powered notes, and manage classes, while students can join groups, access shared resources, and stay updated in real-time.",
  },
  {
    question: "How can teachers generate AI-powered notes?",
    answer:
      "Teachers can use our built-in AI notes generator to quickly create structured notes. Simply input your topic, and the AI will generate clear, concise, and accurate notes that can be shared with students instantly.",
  },
  {
    question: "Can students join multiple groups?",
    answer:
      "Yes! Students can join multiple groups created by different teachers, making it easier to manage subjects and stay connected across various classes.",
  },
  {
    question: "Is ClassBuddy secure for sharing notes?",
    answer:
      "Absolutely. We use secure authentication and encrypted storage to ensure that only authorized members of a group can view and edit the shared notes.",
  },
  {
    question: "Does ClassBuddy support real-time updates?",
    answer:
      "Yes. When a teacher updates a note or adds new content, all students in the group are notified in real-time so everyone stays on the same page.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="w-full py-24 relative bg-white dark:bg-[#08101F] border-t border-border/40 overflow-hidden">
      {/* Background divider line at top */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto mt-2 mb-12">
          {/* Section Heading */}
          <h2 className="text-4xl md:text-5xl tracking-tight font-extrabold text-center mb-6 text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg font-medium text-center">
            Here are some common questions about how ClassBuddy works for teachers
            and students.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4 max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`border bg-card/40 backdrop-blur-xl rounded-2xl overflow-hidden transition-all duration-300 ${
                openIndex === index ? "border-primary/30 shadow-sm" : "border-border/50 hover:border-border"
              }`}
            >
              {/* Question Row */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center px-6 py-5 text-left focus:outline-none transition-colors hover:bg-muted/10"
              >
                <span className={`text-lg font-semibold transition-colors ${openIndex === index ? 'text-primary' : 'text-foreground'}`}>
                  {faq.question}
                </span>
                <div className={`p-1 rounded-full transition-colors ${openIndex === index ? 'bg-primary/10 text-primary' : 'bg-muted/50 text-muted-foreground'}`}>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>

              {/* Answer Section */}
              <div
                className={`px-6 text-muted-foreground text-[15px] leading-relaxed transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? "max-h-40 pb-6 opacity-100"
                    : "max-h-0 pb-0 opacity-0 overflow-hidden"
                }`}
              >
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
