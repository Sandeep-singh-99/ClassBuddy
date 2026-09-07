import {
  FileText,
  Sparkles,
  RefreshCw,
  HelpCircle,
  Layers,
  Zap,
  CheckCircle2,
  FileCheck2,
  ListTodo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ActivePdfInfo {
  name: string;
  size: string;
  pages: number;
  subject?: string;
  isCustom?: boolean;
}

interface PdfDocumentInfoCardProps {
  pdfInfo: ActivePdfInfo;
  onChangePdf: () => void;
  onQuickAction: (actionPrompt: string) => void;
}

export default function PdfDocumentInfoCard({
  pdfInfo,
  onChangePdf,
  onQuickAction,
}: PdfDocumentInfoCardProps) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
      {/* Primary Active PDF Details Card */}
      <Card className="border-border/60 bg-card shadow-xs overflow-hidden">
        <CardHeader className="p-4 pb-3 bg-gradient-to-br from-primary/5 via-transparent to-indigo-500/5 border-b border-border/40">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 text-white shadow-sm shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm font-bold truncate tracking-tight">
                  {pdfInfo.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                  <span>{pdfInfo.pages} Pages</span>
                  <span>•</span>
                  <span>{pdfInfo.size}</span>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onChangePdf}
              title="Change PDF Document"
              className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 rounded-lg"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Status & Stats Badges */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>AI Indexing Complete</span>
            </div>
            <Badge variant="outline" className="bg-emerald-500/20 border-0 text-[10px] font-bold">
              100% Vectorized
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-accent/40 border border-border/40">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                Total Pages
              </span>
              <span className="font-extrabold text-sm text-foreground">
                {pdfInfo.pages}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-accent/40 border border-border/40">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                Citations
              </span>
              <span className="font-extrabold text-sm text-primary">
                Instant
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick AI Assist Actions */}
      <Card className="border-border/60 bg-card shadow-xs">
        <CardHeader className="p-4 pb-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500 fill-amber-500/20" />
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Quick AI Actions
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-3 space-y-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onQuickAction("Summarize key concepts from this document into bullet points.")
            }
            className="w-full justify-start text-xs font-medium rounded-xl gap-2 hover:bg-primary/10 hover:text-primary transition-all text-left"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span>Summarize Document</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onQuickAction("Generate 5 practice multiple choice questions based on chapter topics.")
            }
            className="w-full justify-start text-xs font-medium rounded-xl gap-2 hover:bg-primary/10 hover:text-primary transition-all text-left"
          >
            <HelpCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>Practice Quiz (5 Qs)</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onQuickAction("Extract essential definitions, formulas, and key terms.")
            }
            className="w-full justify-start text-xs font-medium rounded-xl gap-2 hover:bg-primary/10 hover:text-primary transition-all text-left"
          >
            <Layers className="h-3.5 w-3.5 text-violet-500 shrink-0" />
            <span>Key Terms & Definitions</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onQuickAction("What are the most critical exam topics highlighted in this PDF?")
            }
            className="w-full justify-start text-xs font-medium rounded-xl gap-2 hover:bg-primary/10 hover:text-primary transition-all text-left"
          >
            <ListTodo className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span>Exam Focus Topics</span>
          </Button>
        </CardContent>
      </Card>

      {/* Change Document Button */}
      <Button
        variant="ghost"
        onClick={onChangePdf}
        className="w-full text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl border border-dashed border-border/80 hover:border-primary/50 gap-2"
      >
        <FileCheck2 className="h-3.5 w-3.5" />
        Upload Different PDF
      </Button>
    </div>
  );
}
