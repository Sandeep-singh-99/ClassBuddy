import { axiosClient } from "@/helper/axiosClient";
import type { ISubscription, IPlan, ICreatePlan } from "@/types/subscription";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

export const fetchSubscription = createAsyncThunk(
  "subscription/plans",
  async (_, thunkApi) => {
    try {
      const response = await axiosClient.get("/subscription/me");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail ??
            error.message ??
            "Fetching subscription failed"
        );
      }
    }
  }
);

export const createSubscriptionPlan = createAsyncThunk(
  "subscription/createPlan",
  async (data: ICreatePlan, thunkApi) => {
    try {
      const response = await axiosClient.post(`/subscription/plan`, data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail ??
            error.message ??
            "Creating plan failed"
        );
      }
    }
  }
);

export const updateSubscriptionPlan = createAsyncThunk(
  "subscription/updatePlan",
  async (
    { plan_id, data }: { plan_id: string; data: Partial<IPlan> },
    thunkApi
  ) => {
    try {
      const response = await axiosClient.put(`/subscription/${plan_id}`, data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail ??
            error.message ??
            "Updating plan failed"
        );
      }
    }
  }
);

export const deleteSubscriptionPlan = createAsyncThunk(
  "subscription/deletePlan",
  async (plan_id: string, thunkApi) => {
    try {
      const response = await axiosClient.delete(`/subscription/${plan_id}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail ??
            error.message ??
            "Deleting plan failed"
        );
      }
    }
  }
);

interface SubscriptionState {
  loading: boolean;
  error: string | null;
  subscription: ISubscription | null;
  plans: IPlan[];
}

const initialState: SubscriptionState = {
  loading: false,
  error: null,
  subscription: null,
  plans: [],
};

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    addPlan: (state, action: PayloadAction<IPlan>) => {
      state.plans.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch Plans
    builder.addCase(fetchSubscription.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchSubscription.fulfilled,
      (state, action: PayloadAction<IPlan[]>) => {
        state.loading = false;
        state.plans = action.payload;
      }
    );
    builder.addCase(fetchSubscription.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Plan
    builder.addCase(updateSubscriptionPlan.fulfilled, (state, action) => {
      if (action.payload) {
        const { planId, data } = action.payload;
        const index = state.plans.findIndex((p) => p.id === planId);
        if (index !== -1) {
          state.plans[index] = { ...state.plans[index], ...data };
        }
      }
    });

    // Delete Plan
    builder.addCase(deleteSubscriptionPlan.fulfilled, (state, action) => {
      if (action.payload) {
        state.plans = state.plans.filter((p) => p.id !== action.payload);
      }
    });
  },
});

export const { addPlan } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
