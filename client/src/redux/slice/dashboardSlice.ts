import { axiosClient } from "@/helper/axiosClient";
import type { StudentInsight } from "@/types/dashboard";
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

export const GenerateDashboardData = createAsyncThunk(
  "career/dashboard",
  async ( {industry}: {industry: string}, thunkApi) => {
    try {
      const response = await axiosClient.post(
        "/student-insight/generate-industry-insight", { industry },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          }
        }
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

    builder.addCase(GenerateDashboardData.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(GenerateDashboardData.fulfilled, (state, action: PayloadAction<StudentInsight>) => {
      state.loading = false;
      state.data = [action.payload, ...state.data];
      state.error = null;
    });

    builder.addCase(GenerateDashboardData.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });


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