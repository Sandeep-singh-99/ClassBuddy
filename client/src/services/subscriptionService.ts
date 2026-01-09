import { axiosClient } from "@/helper/axiosClient";

export interface CreatePlanPayload {
  plan_name: string;
  amount: number;
  validity_days: number;
}

export interface PlanResponse {
  id: string;
  plan_name: string;
  amount: number;
  validity_days: number;
  created_at: string;
  updated_at: string;
  group_id: string;
}

export const createSubscriptionPlan = async (
  groupId: string,
  data: CreatePlanPayload
) => {
  const response = await axiosClient.post<PlanResponse>(
    `/subscription/group/${groupId}/plan`,
    data
  );
  return response.data;
};
