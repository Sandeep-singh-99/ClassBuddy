import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { JoinedCheckStatus, viewAllTeacher } from "@/redux/slice/tSlice";
import { useEffect } from "react";
import { User, JoystickIcon } from "lucide-react";
import { useJoinToGroup } from "@/helper/useJoinToGroup";
import { BarLoader } from "react-spinners";

export default function ViewAllTeacher() {
  const dispatch = useAppDispatch();
  const { joinGroup } = useJoinToGroup();

  const { teachers, joinedStatus, loading, error } = useAppSelector(
    (state) => state.teachers
  );

  useEffect(() => {
    dispatch(viewAllTeacher());
  }, [dispatch]);

  useEffect(() => {
    if (teachers.length > 0) {
      teachers.forEach((teacher) => {
        dispatch(JoinedCheckStatus(teacher.id));
      });
    }
  }, [dispatch, teachers]);

  if (loading) {
    return <BarLoader width={"100%"} color="gray" className="my-4" />
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-red-500 dark:text-red-400 font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100 tracking-tight">
        View All Teachers
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teachers.map((teacher) => (
          <Card
            key={teacher.id}
            className="border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl
            rounded-3xl overflow-hidden transition-all duration-300
            bg-white dark:bg-gray-900 group"
          >
            {/* Group Cover Image */}
            <CardHeader className="p-0 relative">
              <img
                src={teacher.image_url}
                alt={teacher.group_name}
                className="w-full h-44 object-fill transition-transform duration-500 group-hover:scale-105"
              />
              <div
                className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90
                text-gray-800 dark:text-gray-100
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
                    className="w-14 h-14 rounded-full border-2 border-gray-200 dark:border-gray-700 shadow-sm object-cover"
                  />
                ) : (
                  <div
                    className="w-14 h-14 rounded-full border-2 border-gray-200 dark:border-gray-700
                    flex items-center justify-center
                    bg-gray-100 dark:bg-gray-800"
                  >
                    <User
                      className="text-gray-500 dark:text-gray-400"
                      size={28}
                    />
                  </div>
                )}

                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                    {teacher.owner.full_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {teacher.owner.email}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                {teacher.group_des}
              </p>

              <div className="mt-5">
                <button
                  className={`w-full flex items-center justify-center gap-2 text-sm py-2 px-4 rounded-xl transition-colors duration-300 ${
                    joinedStatus[teacher.id]
                      ? "bg-green-600 text-white cursor-not-allowed"
                      : "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200"
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