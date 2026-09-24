import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { JoinedCheckStatus, viewAllTeacher } from "@/redux/slice/tSlice";
import { useEffect, useMemo } from "react";
import { User, JoystickIcon, AlertCircle, FolderX } from "lucide-react";
import { useJoinToGroup } from "@/helper/useJoinToGroup";
import TeacherCardSkeleton from "@/components/skeletons/TeacherCardSkeleton";

export default function ViewAllTeacher() {
  const dispatch = useAppDispatch();
  const { joinGroup } = useJoinToGroup();

  const { teachers, joinedStatus, loading, error } = useAppSelector(
    (state) => state.teachers
  );

  useEffect(() => {
    if (teachers.length === 0) {
      dispatch(viewAllTeacher());
    }
  }, [dispatch, teachers.length]);

  // Filter out any entries where teacher group has not been properly created
  const activeTeacherGroups = useMemo(() => {
    return teachers.filter(
      (t) => t && t.id && t.group_name && t.owner && t.owner.full_name
    );
  }, [teachers]);

  useEffect(() => {
    if (activeTeacherGroups.length > 0) {
      activeTeacherGroups.forEach((teacher) => {
        dispatch(JoinedCheckStatus(teacher.id));
      });
    }
  }, [dispatch, activeTeacherGroups]);

  return (
    <div className="p-6 sm:p-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Join Teacher Groups
        </h1>
        <p className="text-sm text-muted-foreground">
          Browse groups created by teachers and join to access notes, assignments, and announcements.
        </p>
      </div>

      {error && (
        <div className="flex items-center justify-center gap-2 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">Error: {error}</span>
        </div>
      )}

      {/* Empty State when no teachers have created a group */}
      {!loading && activeTeacherGroups.length === 0 && !error && (
        <Card className="border-dashed border-border/80 bg-card/40 rounded-3xl p-12 text-center shadow-xs">
          <CardContent className="space-y-3">
            <div className="p-4 bg-muted/60 rounded-full w-fit mx-auto text-muted-foreground">
              <FolderX className="h-8 w-8" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-semibold text-lg text-foreground">No Teacher Groups Created Yet</h3>
              <p className="text-sm text-muted-foreground">
                Only teachers who have created a group will appear here. Check back later after your teacher sets up their class group.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teacher Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading
          ? Array.from({ length: 6 }).map((_, idx) => (
              <TeacherCardSkeleton key={idx} />
            ))
          : activeTeacherGroups.map((teacher) => (
              <Card
                key={teacher.id}
                className="border border-border shadow-md hover:shadow-xl
                rounded-3xl overflow-hidden transition-all duration-300
                bg-card group flex flex-col justify-between"
              >
                {/* Group Cover Image */}
                <CardHeader className="p-0 relative">
                  {teacher.image_url ? (
                    <img
                      src={teacher.image_url}
                      alt={teacher.group_name}
                      className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-44 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-muted-foreground">
                      <FolderX className="h-10 w-10 opacity-40" />
                    </div>
                  )}
                  <div
                    className="absolute top-4 right-4 bg-background/90
                    text-foreground
                    px-3 py-1 text-xs font-semibold rounded-full shadow"
                  >
                    {teacher.group_name}
                  </div>
                </CardHeader>

                {/* Teacher Content */}
                <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      {teacher.owner?.image_url ? (
                        <img
                          src={teacher.owner.image_url}
                          alt={teacher.owner.full_name}
                          className="w-14 h-14 rounded-full border-2 border-border shadow-sm object-cover"
                        />
                      ) : (
                        <div
                          className="w-14 h-14 rounded-full border-2 border-border
                          flex items-center justify-center
                          bg-muted"
                        >
                          <User
                            className="text-gray-500 dark:text-gray-400"
                            size={28}
                          />
                        </div>
                      )}

                      <div>
                        <p className="font-semibold text-foreground text-base">
                          {teacher.owner?.full_name || "Teacher"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {teacher.owner?.email || ""}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {teacher.group_des || "No description provided."}
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      className={`w-full flex items-center justify-center gap-2 text-sm py-2.5 px-4 rounded-xl font-medium transition-colors duration-300 ${
                        joinedStatus[teacher.id]
                          ? "bg-green-600 text-white cursor-not-allowed"
                          : "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                      }`}
                      disabled={joinedStatus[teacher.id]}
                      onClick={(e) => {
                        e.preventDefault();
                        joinGroup(teacher?.id);
                      }}
                    >
                      <JoystickIcon size={16} />
                      {joinedStatus[teacher.id] ? "Joined" : "Join Group"}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  );
}
