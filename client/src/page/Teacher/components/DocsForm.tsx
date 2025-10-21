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
import { useAppDispatch } from "@/hooks/hooks";
import { DocsUpload } from "@/redux/slice/docsSlice";
import { PlusCircle } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-toastify";

export default function DocsForm() {
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState<string>("");

  const [open, setOpen] = useState(false);

  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await dispatch(DocsUpload({ filename, file })).unwrap();

      toast.success("Document uploaded successfully");

      setFile(null);
      setFilename("");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to upload document");
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"destructive"}>
          <PlusCircle className="h-4 w-4" />
          Upload Document
          </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload your documents here and click upload when you're ready.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="file">Select Document</Label>
              <Input
                id="file"
                name="file"
                type="file"
                className="input"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="filename">Document Name</Label>
              <Input
                value={filename}
                id="filename"
                name="filename"
                type="text"
                className="input"
                onChange={(e) => setFilename(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Upload</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
