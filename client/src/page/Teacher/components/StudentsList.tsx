import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/hooks/hooks";
import { Users, Search, Mail, Hash, UserX } from "lucide-react";

export default function StudentsList() {
  const { teachers } = useAppSelector((state) => state.teachers);
  const [searchQuery, setSearchQuery] = useState("");

  const studentMembers = teachers[0]?.members || [];

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return studentMembers;
    const q = searchQuery.toLowerCase();
    return studentMembers.filter(
      (s) =>
        s.full_name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.id?.toString().toLowerCase().includes(q)
    );
  }, [studentMembers, searchQuery]);

  return (
    <Card className="mb-8 border border-border/60 shadow-sm rounded-2xl bg-card overflow-hidden">
      <CardHeader className="p-6 pb-4 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              Enrolled Students
              <Badge
                variant="secondary"
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground"
              >
                {studentMembers.length} Total
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Overview of students registered in your active classes
            </CardDescription>
          </div>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search student name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl border-border/80"
          />
        </div>
      </CardHeader>

      {!studentMembers.length ? (
        <CardContent className="py-12 text-center text-muted-foreground space-y-2">
          <div className="p-3 bg-muted rounded-full w-fit mx-auto">
            <UserX className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-semibold text-sm text-foreground">No Students Found</p>
          <p className="text-xs max-w-sm mx-auto text-muted-foreground">
            No students are currently enrolled in your group.
          </p>
        </CardContent>
      ) : filteredStudents.length === 0 ? (
        <CardContent className="py-10 text-center text-muted-foreground space-y-2">
          <p className="font-medium text-sm text-foreground">No matching students</p>
          <p className="text-xs text-muted-foreground">
            No students matched your search query "{searchQuery}".
          </p>
        </CardContent>
      ) : (
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40 dark:bg-muted/20">
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-muted-foreground py-3 pl-6">
                    Student
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground py-3">
                    ID
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground py-3">
                    Email Address
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground py-3 text-right pr-6">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredStudents.map((student) => {
                  const initials = student.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "ST";

                  return (
                    <TableRow
                      key={student.id}
                      className="border-border/40 hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="py-3 pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border/60 shadow-xs">
                            <AvatarImage
                              src={student.image_url}
                              alt={student.full_name}
                              className="object-cover"
                            />
                            <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-sm text-foreground">
                            {student.full_name}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md border border-border/40">
                          <Hash className="h-3 w-3 text-muted-foreground/70" />
                          {student.id}
                        </span>
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="h-3.5 w-3.5 opacity-60 shrink-0" />
                          <span>{student.email}</span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 text-right pr-6">
                        <Badge
                          variant="outline"
                          className="text-[11px] font-medium border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        >
                          Enrolled
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
