import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Link } from "react-router-dom";



export default function RecentNotes() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Notes</CardTitle>
          <Button
            className="text-muted-foreground "
            size={"sm"}
            variant={"ghost"}
          >
            View All
          </Button>
        </div>
      </CardHeader>

      {/* <CardContent>No recent articles found.</CardContent> */}

      <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
             
                <TableRow>
                  <TableCell className="font-medium">sasdddddddddddddddddddd</TableCell>
                  <TableCell>
                    <Badge
                      variant={"secondary"}
                      className="rounded-full bg-green-100 text-green-800"
                    >
                      published
                    </Badge>
                  </TableCell>
                  <TableCell>s</TableCell>
                  <TableCell>
                    sdasd
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link to={""}>
                        <Button variant={"ghost"} size={"sm"}>
                          Edit
                        </Button>
                      </Link>
                      {/* <DeleteBtn articleId={article.id} /> */}
                      Delete
                    </div>
                  </TableCell>
                </TableRow>
           
            </TableBody>
          </Table>
        </CardContent>
     
    </Card>
  );
}
