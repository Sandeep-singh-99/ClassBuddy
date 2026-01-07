import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { JoinedCheckStatus, viewAllTeacher } from "@/redux/slice/tSlice";
import { useEffect } from "react";
import { User, JoystickIcon, AlertCircle } from "lucide-react";
import { useJoinToGroup } from "@/helper/useJoinToGroup";
import { BarLoader } from "react-spinners";

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

  useEffect(() => {
    if (teachers.length > 0) {
      teachers.forEach((teacher) => {
        dispatch(JoinedCheckStatus(teacher.id));
      });
    }
  }, [dispatch, teachers]);

  if (loading) {
    return <BarLoader width={"100%"} color="gray" className="my-4" />;
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-8 text-foreground tracking-tight">
        View All Teachers
      </h1>

      {error && (
        <div className="flex items-center justify-center gap-2 p-4 mb-6 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Error: {error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teachers.map((teacher) => (
          <Card
            key={teacher.id}
            className="border border-border shadow-md hover:shadow-xl
            rounded-3xl overflow-hidden transition-all duration-300
            bg-card group"
          >
            {/* Group Cover Image */}
            <CardHeader className="p-0 relative">
              <img
                src={teacher.image_url}
                alt={teacher.group_name}
                className="w-full h-44 object-fill transition-transform duration-500 group-hover:scale-105"
              />
              <div
                className="absolute top-4 right-4 bg-background/90
                text-foreground
                px-3 py-1 text-xs font-semibold rounded-full shadow"
              >
                {teacher.group_name}
              </div>
            </CardHeader>

            {/* Teacher Content */}
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                {teacher.owner.image_url ? (
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
                    {teacher.owner.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {teacher.owner.email}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {teacher.group_des}
              </p>

              <div className="mt-5">
                <button
                  className={`w-full flex items-center justify-center gap-2 text-sm py-2 px-4 rounded-xl transition-colors duration-300 ${
                    joinedStatus[teacher.id]
                      ? "bg-green-600 text-white cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
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
