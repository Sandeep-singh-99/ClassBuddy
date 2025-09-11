import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { generateNotes } from "@/redux/slice/tSlice";
import React, { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function TNotes() {
  const [visible, setVisible] = useState(true);
  const [title, setTitle] = useState("");

  const dispatch = useAppDispatch();

  const { generatedNotes, loading } = useAppSelector((state) => state.teachers);
 

  const handleGenerateNotes = (e: React.FormEvent) => {
    e.preventDefault();
    setVisible(true);

    dispatch(generateNotes(title));
  };

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    // Save notes logic here
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Button type="submit" className="mt-4" disabled={loading}>
              {loading ? "Generating..." : "Generate Notes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {visible && (
        <div className="mt-6">
          <Card>
            <CardContent>
              <form onSubmit={handleSaveNotes}>
                <div className="grid gap-4 mb-4">
                  <Label>
                    Notes Title
                  </Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter notes title..." />
                </div>
                <div className="mb-4">
                  <MDEditor.Markdown source={generatedNotes ?? ""} className="p-2 rounded-md h-96 overflow-y-auto" />
                </div>
                <Button>
                  Save Notes
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
