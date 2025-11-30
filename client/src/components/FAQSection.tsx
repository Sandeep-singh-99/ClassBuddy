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
    <section id="faq" className="py-20 bg-gray-50 text-gray-900">
      <div className="max-w-3xl mx-auto px-6">
        {/* Section Heading */}
        <h2 className="text-4xl font-bold text-center mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-600 text-center mb-12">
          Here are some common questions about how ClassBuddy works for teachers
          and students.
        </p>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 bg-white rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md"
            >
              {/* Question Row */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center px-4 py-4 text-left focus:outline-none"
              >
                <span className="text-lg font-medium text-gray-800">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {/* Answer Section */}
              <div
                className={`px-4 pb-4 text-gray-600 transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? "max-h-40 opacity-100"
                    : "max-h-0 opacity-0 overflow-hidden"
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
