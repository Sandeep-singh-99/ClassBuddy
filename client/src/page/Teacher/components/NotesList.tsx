import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useAppSelector } from "@/hooks/hooks";
import { Link } from "react-router-dom";
import DeleteBtn from "./DeleteBtn";

export default function NotesList() {
  const { notes } = useAppSelector((state) => state.notes);
  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Notes</CardTitle>
        </div>
      </CardHeader>

      {!notes.length ? (
        <CardContent>No Notes found.</CardContent>
      ): (
         <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {
                notes.map((note) => (
                  <TableRow key={note.id}>
                  <TableCell className="font-medium">{note.id}</TableCell>
                  <TableCell>{note.title}</TableCell>
                  <TableCell>
                    {note.created_at?.toString().slice(0, 10)}
                  </TableCell>
                   <TableCell>
                    <div className="flex items-center gap-2">
                      <Link to={`/view-notes/${note.id}`}>
                        <Button variant={"ghost"} size={"sm"}>
                          View
                        </Button>
                      </Link>
                      <Link to={`/t-dashboard/update-note/${note.id}`}>
                        <Button variant={"secondary"} size={"sm"}>
                          Update
                        </Button>
                      </Link>
                      <DeleteBtn noteId={note.id} />
                    </div>
                  </TableCell>
                </TableRow>
                ))
              }
           
            </TableBody>
          </Table>
        </CardContent>
      )}
    </Card>
  );
}
