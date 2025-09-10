import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useAppSelector } from "@/hooks/hooks";



export default function StudentsList() {
  const { teachers } = useAppSelector((state) => state.teachers);
  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Students</CardTitle>
          {/* <Button
            className="text-muted-foreground "
            size={"sm"}
            variant={"ghost"}
          >
            View All
          </Button> */}
        </div>
      </CardHeader>

      {!teachers.length ? (
        <CardContent>No Students found.</CardContent>
      ): (
         <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {
                teachers[0]?.members.map((student) => (
                  <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.id}</TableCell>
                  <TableCell>
                    <img src={student.image_url} alt={student.full_name} className="rounded-full h-10 w-10 object-cover"  />
                  </TableCell>

                  <TableCell>{student.full_name}</TableCell>
                  <TableCell>
                    {student.email}
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
