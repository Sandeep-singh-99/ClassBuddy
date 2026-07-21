import { useState } from "react";
import { toast } from "sonner";
import {
  UploadCloud,
  FileUp,
  FileText,
  Loader2,
  Sparkles,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch } from "@/hooks/hooks";
import { DocsUpload } from "@/redux/slice/docsSlice";

export default function DocsForm() {
  const dispatch = useAppDispatch();
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (selected && !filename) {
      // Auto-populate document name without extension
      const nameWithoutExt = selected.name.replace(/\.[^/.]+$/, "");
      setFilename(nameWithoutExt);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a document file to upload.");
      return;
    }

    setLoading(true);
    try {
      await dispatch(DocsUpload({ filename: filename.trim() || file.name, file })).unwrap();
      toast.success("Document uploaded successfully!");
      setFile(null);
      setFilename("");
      setOpen(false);
    } catch (error: any) {
      toast.error(error || "Failed to upload document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md shadow-primary/20 transition-all gap-2 cursor-pointer">
          <UploadCloud className="h-4 w-4" />
          <span>Upload Document</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px] border-border/80 bg-card text-card-foreground shadow-2xl p-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border/60">
          <DialogHeader className="space-y-1 text-left">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <FileUp className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="text-xs font-normal border-primary/20 text-primary">
                <Sparkles className="h-3 w-3 mr-1" /> Resource Library
              </Badge>
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground pt-2">
              Upload Document
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Upload course PDFs, notes, slides, or documents for student access.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* File Selector */}
          <div className="space-y-2">
            <Label htmlFor="file" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <UploadCloud className="h-4 w-4 text-primary" /> Select File
            </Label>
            
            <div className="relative border-2 border-dashed border-border hover:border-primary/60 rounded-xl p-4 transition-all bg-background/50 flex flex-col items-center justify-center text-center space-y-2 group">
              <input
                id="file"
                name="file"
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                {file ? <Check className="h-6 w-6 text-emerald-500" /> : <FileUp className="h-6 w-6" />}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-foreground">
                  {file ? file.name : "Click or drag & drop file to upload"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Supports PDF, DOCX, TXT, Code files & Images
                </p>
              </div>
            </div>
          </div>

          {/* Document Name Field */}
          <div className="space-y-2">
            <Label htmlFor="filename" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-primary" /> Document Title / Name
            </Label>
            <Input
              id="filename"
              name="filename"
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="e.g. Chapter 4 Lecture Notes"
              className="bg-background/80 border-border text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-primary h-10"
            />
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={loading} className="border-border">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={loading || !file}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 cursor-pointer shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  <span>Upload File</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
