import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface SamplePdf {
  id: string;
  name: string;
  size: string;
  pages: number;
  subject: string;
  description: string;
}

const SAMPLE_PDFS: SamplePdf[] = [
  {
    id: "cn-syllabus",
    name: "Computer Networks & Protocols.pdf",
    size: "2.4 MB",
    pages: 24,
    subject: "Computer Science",
    description: "OSI Model, TCP/IP Suite, Routing Algorithms & Subnetting",
  },
  {
    id: "os-notes",
    name: "Operating Systems - Memory & Threads.pdf",
    size: "1.8 MB",
    pages: 18,
    subject: "Software Engineering",
    description: "Process Synchronization, Deadlocks, Paging & Virtual Memory",
  },
  {
    id: "dbms-guide",
    name: "Database Systems & SQL Optimization.pdf",
    size: "3.2 MB",
    pages: 30,
    subject: "Information Tech",
    description: "ER Models, Relational Algebra, B-Trees & Query Execution Plans",
  },
];

interface PdfUploadDropzoneProps {
  onSelectPdf: (fileInfo: {
    name: string;
    size: string;
    pages: number;
    subject?: string;
    isCustom?: boolean;
  }) => void;
}

export default function PdfUploadDropzone({
  onSelectPdf,
}: PdfUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setErrorMsg(null);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setErrorMsg("Please upload a valid PDF document (.pdf format only)");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg("File size exceeds 25 MB limit");
      return;
    }

    const formattedSize = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    // Estimated page count for demo uploaded file
    const estimatedPages = Math.max(5, Math.floor(file.size / (150 * 1024)));

    onSelectPdf({
      name: file.name,
      size: formattedSize,
      pages: estimatedPages,
      subject: "Uploaded PDF",
      isCustom: true,
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-400">
      {/* Hero Welcome Banner */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>ClassBuddy AI PDF Reader</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-primary">
          Chat with Any PDF Document
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          Upload your lecture notes, textbook chapters, or assignment PDFs. Our AI answers questions, summarizes chapters, and cites page numbers automatically.
        </p>
      </div>

      {/* Main Upload Dropzone */}
      <Card
        className={`border-2 border-dashed transition-all duration-300 relative overflow-hidden bg-card/60 backdrop-blur-xs shadow-sm hover:shadow-md ${
          isDragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border/80 hover:border-primary/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,application/pdf"
            className="hidden"
          />

          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary/20 via-indigo-500/10 to-violet-500/20 flex items-center justify-center text-primary shadow-inner">
              <Upload className="h-10 w-10 animate-bounce duration-1000" />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold">
              AI
            </span>
          </div>

          <div className="space-y-2 max-w-md">
            <h3 className="text-lg font-bold tracking-tight">
              Drag & Drop your PDF here
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Supports notes, research papers, syllabus, or textbooks up to 25MB
            </p>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 text-xs font-medium text-destructive bg-destructive/10 px-4 py-2 rounded-xl border border-destructive/20 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl font-semibold shadow-md gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <FileText className="h-4 w-4" />
              Browse PDF File
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 text-[11px] font-medium text-muted-foreground pt-2">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              OCR Text Extraction
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Instant Page Citations
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
              100% Private & Secure
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Preset Sample Documents Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Or Try a Sample Class Document
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">Click to preview AI chat</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_PDFS.map((sample) => (
            <Card
              key={sample.id}
              onClick={() =>
                onSelectPdf({
                  name: sample.name,
                  size: sample.size,
                  pages: sample.pages,
                  subject: sample.subject,
                  isCustom: false,
                })
              }
              className="group cursor-pointer border-border/60 hover:border-primary/50 bg-card hover:bg-accent/40 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <FileText className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-medium">
                    {sample.pages} Pages
                  </Badge>
                </div>

                <div>
                  <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {sample.name}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                    {sample.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] font-medium text-muted-foreground">
                  <span>{sample.size}</span>
                  <span className="flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform">
                    Open Chat
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
