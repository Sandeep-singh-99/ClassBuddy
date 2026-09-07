import { useState } from "react";
import PdfUploadDropzone from "../../components/PdfAiChat/PdfUploadDropzone";
import PdfDocumentInfoCard from "../../components/PdfAiChat/PdfDocumentInfoCard";
import type { ActivePdfInfo } from "../../components/PdfAiChat/PdfDocumentInfoCard";
import PdfChatWindow from "../../components/PdfAiChat/PdfChatWindow";
import type { Message } from "../../components/PdfAiChat/PdfChatWindow";
import PdfSkeleton from "../../components/PdfAiChat/PdfSkeleton";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function PdfAiChat() {
  const [activePdf, setActivePdf] = useState<ActivePdfInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // Handle PDF document selection (from dropzone or sample chips)
  const handleSelectPdf = (pdfInfo: ActivePdfInfo) => {
    setIsLoading(true);
    toast.info(`Indexing ${pdfInfo.name}...`);

    setTimeout(() => {
      setActivePdf(pdfInfo);
      setIsLoading(false);
      toast.success(`${pdfInfo.name} ready for AI Chat!`);

      // Initialize default welcome AI greeting message
      const initialGreeting: Message = {
        id: "msg-welcome",
        sender: "ai",
        text: `Hello! I have indexed **"${pdfInfo.name}"** (${pdfInfo.pages} pages). \n\nHere is what I can help you with:\n• 📌 Summarize key concepts or specific pages\n• ❓ Generate practice quizzes & sample exam questions\n• 💡 Explain complex formulas or diagrams\n\nWhat would you like to explore first?`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        citation: `Pages 1–${pdfInfo.pages}`,
      };
      setMessages([initialGreeting]);
    }, 900);
  };

  // Handle sending user questions
  const handleSendMessage = (userText: string) => {
    if (!activePdf) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsAiTyping(true);

    // Simulate context-aware AI response based on PDF content
    setTimeout(() => {
      const pageNum = Math.floor(Math.random() * activePdf.pages) + 1;
      let aiText = "";

      const lower = userText.toLowerCase();
      if (lower.includes("summarize") || lower.includes("summary")) {
        aiText = `Here is a concise summary of **${activePdf.name}**:\n\n1. **Core Fundamentals**: Introduces key concepts, terminology, and foundational principles.\n2. **Architectural Framework**: Outlines the structural models and step-by-step methodologies.\n3. **Practical Application**: Focuses on problem-solving strategies, optimization, and real-world examples.`;
      } else if (lower.includes("quiz") || lower.includes("question") || lower.includes("exam")) {
        aiText = `Based on page ${pageNum} of your document, here are 2 practice questions:\n\n**Q1:** What is the main objective of the protocol discussed in Chapter 2?\n*A)* Data compression\n*B)* Error control & flow regulation\n*C)* File encryption\n\n**Q2:** Explain the trade-off between latency and bandwidth requirement.`;
      } else if (lower.includes("term") || lower.includes("definition") || lower.includes("formula")) {
        aiText = `Key definitions extracted from page ${pageNum}:\n\n• **Throughput**: Rate of successful message delivery over a communication channel.\n• **Latency**: Total time taken for a data packet to travel from source to destination.\n• **Jitter**: Variation in packet arrival delay.`;
      } else {
        aiText = `According to page ${pageNum} in **"${activePdf.name}"**, the document explains that this concept relies on layered abstraction to ensure modular scalability and security. \n\nWould you like me to elaborate on the specific steps or generate a step-by-step diagram outline?`;
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        citation: `Page ${pageNum}, Section 2.${pageNum % 4 + 1}`,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsAiTyping(false);
    }, 1200);
  };

  const handleClearChat = () => {
    if (!activePdf) return;
    setMessages([
      {
        id: `welcome-reset-${Date.now()}`,
        sender: "ai",
        text: `Chat history cleared. What else would you like to ask about **${activePdf.name}**?`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    toast.success("Chat history cleared");
  };

  const handleChangePdf = () => {
    setActivePdf(null);
    setMessages([]);
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* ── Top Header Bar ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              PDF AI Chat
            </h1>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Upload course materials, ask instant questions, and receive page-cited answers.
          </p>
        </div>

        {activePdf && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleChangePdf}
            className="rounded-xl text-xs font-semibold gap-2 border-border/80 hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Upload New Document
          </Button>
        )}
      </div>

      {/* ── Main Dynamic Content Area ───────────────────────────────────── */}
      {isLoading ? (
        <PdfSkeleton />
      ) : !activePdf ? (
        <PdfUploadDropzone onSelectPdf={handleSelectPdf} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-210px)] min-h-[550px] animate-in fade-in duration-300">
          {/* Left Column: PDF Metadata & Quick AI Tools */}
          <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1">
            <PdfDocumentInfoCard
              pdfInfo={activePdf}
              onChangePdf={handleChangePdf}
              onQuickAction={handleSendMessage}
            />
          </div>

          {/* Right Column: AI Chat Panel */}
          <div className="lg:col-span-8 h-full">
            <PdfChatWindow
              pdfInfo={activePdf}
              messages={messages}
              isAiTyping={isAiTyping}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearChat}
            />
          </div>
        </div>
      )}
    </div>
  );
}
