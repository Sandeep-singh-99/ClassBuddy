import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { generateNotes, saveNotes } from "@/redux/slice/tSlice";
import React, { useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { Loader } from "lucide-react";

export default function TNotes() {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState("");

  const dispatch = useAppDispatch();

  const { generatedNotes, loading } = useAppSelector((state) => state.teachers);

  useEffect(() => {
    if (!loading && generatedNotes) {
      setVisible(true);
    }
  }, [loading, generatedNotes]);

  const handleGenerateNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast.info("Generating notes, please wait...");
      await dispatch(generateNotes(title)).unwrap();
      toast.success("Notes generated successfully!");
    } catch (error) {
      toast.error(
        (error as string) || "Failed to generate notes. Please try again."
      );
    }
  };

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", generatedNotes ?? "");

    try {
      dispatch(saveNotes(formData));
      setTitle("");
      setVisible(false);
      toast.success("Notes saved successfully!");
    } catch (error) {
      // console.log("Error saving notes:", error);
      toast.error("Failed to save notes. Please try again.");
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
