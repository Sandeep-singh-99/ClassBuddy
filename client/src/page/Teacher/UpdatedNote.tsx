import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { teachersGetNoteById } from "@/redux/slice/noteSlice";
import { updateNotes } from "@/redux/slice/tSlice";
import MDEditor from "@uiw/react-md-editor";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function UpdatedNote() {
  const { noteId } = useParams<{ noteId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentNote } = useAppSelector((state) => state.notes);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (noteId) {
      dispatch(teachersGetNoteById(noteId));
    }
  }, [dispatch, noteId]);

  // When currentNote changes, populate formData with it
  useEffect(() => {
    if (currentNote) {
      setFormData({
        title: currentNote.title || "",
        content: currentNote.content || "",
      });
    }
  }, [currentNote]);

  // Handle editor content change
  const handleContentChange = (value?: string) => {
    setFormData((prev) => ({ ...prev, content: value || "" }));
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Prepare update payload
    const payload: Record<string, string> = {};

    if (formData.title !== currentNote?.title) {
      payload.title = formData.title;
    }
    if (formData.content !== currentNote?.content) {
      payload.content = formData.content;
    }

    if (noteId && Object.keys(payload).length > 0) {
      dispatch(updateNotes({ noteId, ...payload }));
      toast.success("Note updated successfully!");
      navigate("/t-dashboard/home")
      setLoading(false);
    } else {
      toast.error("No changes detected!");
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Update Note</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Title Input */}
            <div className="flex flex-col space-y-1.5 mb-4 gap-2">
              <Label>Title</Label>
              <Input
                placeholder="Enter title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            {/* Markdown Editor */}
            <MDEditor
              value={formData.content}
              onChange={handleContentChange}
              className="min-h-[400px]"
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Note"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
