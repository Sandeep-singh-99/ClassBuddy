import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { saveNotes, updateNotes } from "@/redux/slice/tSlice";
import { setLoading, setGeneratedNotes, setCurrentNoteId, setError } from "@/redux/slice/tSlice";
import React, { useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader, Sparkles, BookOpen, Save, FileText, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-provider";
import { fetchSSEStream } from "@/helper/sseStream";
import { Badge } from "@/components/ui/badge";

export default function TNotes() {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState("");

  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  const colorMode = theme === "dark" ? "dark" : "light";

  const { generatedNotes, loading, currentNoteId } = useAppSelector((state) => state.teachers);

  useEffect(() => {
    if (!loading && generatedNotes) {
      setVisible(true);
    }
  }, [loading, generatedNotes]);

  const handleGenerateNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      toast.info("Generating AI study notes, please wait...");
      dispatch(setLoading(true));
      dispatch(setGeneratedNotes(""));
      dispatch(setCurrentNoteId(null));
      dispatch(setError(null));
      setVisible(true);

      const formData = new URLSearchParams();
      formData.append("title", title);

      let currentText = "";
      let capturedNoteId: string | null = null;

      await fetchSSEStream({
        url: `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1"}/notes/notes-generates`,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
        onChunk: (data) => {
          if (data.chunk) {
            currentText += data.chunk;
            dispatch(setGeneratedNotes(currentText));
          }
          if (data.note_id && !capturedNoteId) {
            capturedNoteId = data.note_id;
            dispatch(setCurrentNoteId(data.note_id));
          }
          if (data.done) {
            toast.success("Notes generated successfully!");
          }
        },
        onDone: () => {
          dispatch(setLoading(false));
        },
        onError: (err) => {
          console.error("Notes streaming error:", err);
          toast.error(err.message || "Failed to generate notes. Please try again.");
          dispatch(setLoading(false));
          dispatch(setError(err.message || "Error"));
        },
      });
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate notes. Please try again."
      );
      dispatch(setLoading(false));
      dispatch(setError(error instanceof Error ? error.message : "Error"));
    }
  };

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentNoteId) {
      try {
        await dispatch(updateNotes({ noteId: currentNoteId, title, content: generatedNotes ?? "" })).unwrap();
        setTitle("");
        setVisible(false);
        toast.success("Notes saved successfully!");
      } catch (error) {
        toast.error("Failed to save notes. Please try again.");
      }
    } else {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", generatedNotes ?? "");

      try {
        await dispatch(saveNotes(formData)).unwrap();
        setTitle("");
        setVisible(false);
        toast.success("Notes saved successfully!");
      } catch (error) {
        toast.error("Failed to save notes. Please try again.");
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-border/50 backdrop-blur-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">AI Note Generator</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Provide a topic or syllabus title and let Gemini AI curate structured study notes in real-time.
          </p>
        </div>
        {visible && generatedNotes && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setVisible(false);
              dispatch(setGeneratedNotes(""));
              setTitle("");
            }}
            className="shrink-0 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Create New
          </Button>
        )}
      </div>

      {/* Input Form Card */}
      <Card className="border-border/60 shadow-sm bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            Create New Notes
          </CardTitle>
          <CardDescription>
            Enter the subject or lesson topic you want to generate comprehensive notes for.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleGenerateNotes} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Topic / Title</Label>
              <Textarea
                placeholder="e.g. Introduction to Quantum Computing, Advanced React Hooks & State Management..."
                className="h-28 bg-background border-input focus-visible:ring-primary text-foreground resize-none"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto gap-2 font-medium cursor-pointer"
              disabled={loading || !title.trim()}
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Generating Real-Time Tokens...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Notes
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Streaming / Loading Indicator */}
      {loading && (
        <Card className="border-primary/30 bg-primary/5 p-4 flex items-center justify-between rounded-xl">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </div>
            <span className="text-sm font-medium text-foreground">
              AI Streaming Response: Generating notes live...
            </span>
          </div>
          <Badge variant="secondary" className="gap-1 font-mono text-xs">
            <Loader className="h-3 w-3 animate-spin" /> SSE Stream Active
          </Badge>
        </Card>
      )}

      {/* Generated Notes Display */}
      {visible && generatedNotes && (
        <Card className="border-border/60 shadow-md bg-card text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-border/40">
            <div className="space-y-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Generated Markdown Notes
              </CardTitle>
              <CardDescription>
                Review or edit the markdown content before saving to your class.
              </CardDescription>
            </div>
            {currentNoteId && (
              <Badge variant="outline" className="gap-1 text-green-600 dark:text-green-400 border-green-500/30">
                <CheckCircle2 className="h-3.5 w-3.5" /> Note Attached
              </Badge>
            )}
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSaveNotes} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Notes Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter notes title..."
                  className="bg-background border-input text-foreground font-semibold"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Markdown Content</Label>
                <div
                  data-color-mode={colorMode}
                  className="rounded-xl overflow-hidden border border-border shadow-inner"
                >
                  <MDEditor
                    value={generatedNotes ?? ""}
                    onChange={(val) => dispatch(setGeneratedNotes(val || ""))}
                    height={480}
                    preview="live"
                    style={{ backgroundColor: "transparent" }}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="gap-2 font-medium cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  Save Notes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Default State */}
      {!loading && !visible && (
        <div className="p-12 text-center border border-dashed border-border/60 rounded-2xl bg-card/50">
          <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="font-semibold text-lg text-foreground mb-1">No Notes Generated Yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Provide a topic title above and click "Generate Notes" to start streaming AI study content.
          </p>
        </div>
      )}
    </div>
  );
}
