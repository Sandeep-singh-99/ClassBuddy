import { axiosClient } from "@/helper/axiosClient";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

export const GenerateDashboardData = createAsyncThunk(
  "career/dashboard",
  async (data , thunkApi) => {
    try {
      const response = await axiosClient.post(
        "/student-insight/generate-industry-insight", data
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail || "Generating notes failed"
        );
      }
    }
  }
);

export const FetchDashboardData = createAsyncThunk(
  "career/fetchDashboard",
  async (_, thunkApi) => {
    try {
      const response = await axiosClient.get("/student-insight/my-insights");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail || "Fetching dashboard data failed"
        );
      }
    }
  }
);

export interface SalaryRange {
  role: string;
  min: number;
  max: number;
  median: number;
  location: string;
}

export interface Owner {
  id: string;
  full_name: string;
  email: string;
  role: "student" | "teacher" | string;
  industry: string;
  image_url: string;
}

export interface StudentInsight {
  salary_range: SalaryRange[];
  growth_rate: number;
  demand_level: "High" | "Medium" | "Low";
  top_skills: string[];
  market_outlook: "Positive" | "Neutral" | "Negative";
  key_trends: string[];
  recommend_skills: string[];
  id: string;
  created_at: string;
  updated_at: string;
  owner: Owner;
}

interface DashboardState {
  data: StudentInsight | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  data: null,
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(FetchDashboardData.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(FetchDashboardData.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.error = null;
    });

    builder.addCase(FetchDashboardData.rejected, (state, action) => {
      state.loading = false;
      state.data = null;
      state.error = action.payload as string;
    });
  },
});


export default dashboardSlice.reducer;