import { useAppDispatch } from "@/hooks/hooks";
import { joinTeacherGroup } from "@/redux/slice/tSlice";
import { AxiosError } from "axios";
import { toast } from "react-toastify";

export const useJoinToGroup = () => {
  const dispatch = useAppDispatch();

  const joinGroup = async (groupId: string) => {
    try {
      const response = await dispatch(joinTeacherGroup(groupId)).unwrap();
      toast.success("Successfully joined the group!");
      return response;
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.detail || "An error occurred. Please try again."
        );
      }
    }
  };

  return { joinGroup };
};
