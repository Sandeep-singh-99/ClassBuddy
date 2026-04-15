import { useAppDispatch } from "@/hooks/hooks";
import { joinTeacherGroup, JoinedCheckStatus } from "@/redux/slice/tSlice";
import { toast } from "sonner";

export const useJoinToGroup = () => {
  const dispatch = useAppDispatch();

  const joinGroup = async (groupId: string) => {
    try {
      const response = await dispatch(joinTeacherGroup(groupId)).unwrap();
      // Update joined status in redux
      await dispatch(JoinedCheckStatus(groupId));
      toast.success("Successfully joined the group!");
      return response;
    } catch (error: any) {
      if (error?.detail) {
        toast.error(error.detail);
      } else if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  return { joinGroup };
};
