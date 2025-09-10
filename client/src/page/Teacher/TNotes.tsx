import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { generateNotes } from "@/redux/slice/tSlice";
import React, { useState } from "react";
import MDEditor from '@uiw/react-md-editor';


export default function TNotes() {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState("");

  const dispatch = useAppDispatch();

  const { generatedNotes } = useAppSelector((state) => state.teachers);

  const handleGenerateNotes = (e: React.FormEvent) => {
    e.preventDefault();
    setVisible(true);

    dispatch(generateNotes(title));
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
            <Button type="submit" className="mt-4">
              Create Notes
            </Button>
          </form>
        </CardContent>
      </Card>

      {visible && (
        <div className="mt-6">
          <Card>
            <CardContent>
               <MDEditor.Markdown source={generatedNotes ?? ""} className="p-2 rounded-md" />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
