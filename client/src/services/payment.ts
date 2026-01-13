import { axiosClient } from "@/helper/axiosClient";


export const createOrder = async (planId: string) => {
  const { data } = await axiosClient.post("/subscription/create-order", {
    plan_id: planId,
  });
  return data;
};
