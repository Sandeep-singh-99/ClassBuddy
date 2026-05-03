import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { saveNotes, updateNotes } from "@/redux/slice/tSlice";
import { setLoading, setGeneratedNotes, setCurrentNoteId, setError } from "@/redux/slice/tSlice";
import React, { useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export default function TNotes() {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState("");

  const dispatch = useAppDispatch();

  const { generatedNotes, loading, currentNoteId } = useAppSelector((state) => state.teachers);

  // Status check effect for polling - REMOVED since we use SSE now
  useEffect(() => {
    if (!loading && generatedNotes) {
      setVisible(true);
    }
  }, [loading, generatedNotes]);

  const handleGenerateNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast.info("Generating notes, please wait...");
      dispatch(setLoading(true));
      dispatch(setGeneratedNotes(""));
      dispatch(setCurrentNoteId(null));
      dispatch(setError(null));
      setVisible(true); // make editor visible so user can see streaming

      const formData = new URLSearchParams();
      formData.append("title", title);

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1"}/notes/notes-generates`,
        formData.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          withCredentials: true,
          responseType: "stream",
          adapter: "fetch",
        }
      );

      if (!response.data) {
        throw new Error("No response data");
      }

      const reader = (response.data as any).getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let currentText = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          const chunkString = decoder.decode(value, { stream: true });
          const lines = chunkString.split('\n');
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.slice(6);
              if (dataStr.trim() === "") continue;
              try {
                const data = JSON.parse(dataStr);
                if (data.error) {
                   throw new Error(data.error);
                }
                if (data.chunk) {
                   currentText += data.chunk;
                   dispatch(setGeneratedNotes(currentText));
                }
                if (data.note_id && !currentNoteId) {
                   dispatch(setCurrentNoteId(data.note_id));
                }
                if (data.done) {
                   toast.success("Notes generated successfully!");
                   dispatch(setLoading(false));
                }
              } catch (e) {
                console.error("Error parsing SSE data", e, dataStr);
              }
            }
          }
        }
      }
      
      dispatch(setLoading(false));
    } catch (error) {
      console.error(error);
      toast.error(
        (error instanceof Error ? error.message : "Failed to generate notes. Please try again.")
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
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Notes</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleGenerateNotes}>
            <Textarea
              placeholder="Provide a title or topic, and our AI will create detailed notes."
              className="h-36"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Button
              type="submit"
              className="mt-4 cursor-pointer"
              disabled={loading || !title.trim()}
            >
              {loading && <Loader className="animate-spin" />}
              Generate Notes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div>
          <p className="mt-6 text-center text-muted-foreground">
            Generating notes, please wait...
          </p>
        </div>
      )}

      {/* Show generated notes */}
      {!loading && visible && generatedNotes && (
        <div className="mt-6">
          <Card>
            <CardContent>
              <form onSubmit={handleSaveNotes}>
                <div className="grid gap-4 mb-4">
                  <Label>Notes Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter notes title..."
                  />
                </div>
                <div className="mb-4">
                  <MDEditor.Markdown
                    source={generatedNotes ?? ""}
                    className="p-2 rounded-md h-96 overflow-y-auto"
                  />
                </div>
                <Button>Save Notes</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Default state */}
      {!loading && !visible && (
        <div>
          <p className="mt-6 text-center text-muted-foreground">
            No notes generated yet. Please enter a title and click "Generate
            Notes".
          </p>
        </div>
      )}
    </div>
  );
}
