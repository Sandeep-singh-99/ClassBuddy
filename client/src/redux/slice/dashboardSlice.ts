import { axiosClient } from "@/helper/axiosClient";
import type { StudentInsight } from "@/types/dashboard";
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { AxiosError } from "axios";

export const GenerateDashboardData = createAsyncThunk(
  "career/dashboard",
  async ({ industry }: { industry: string }, thunkApi) => {
    try {
      const params = new URLSearchParams();
      params.append("industry", industry);

      const response = await axiosClient.post(
        "/student-insight/",
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail ?? error.message ?? "Generating industry insights failed"
        );
      }
      return thunkApi.rejectWithValue("Generating industry insights failed");
    }
  }
);

export const FetchDashboardData = createAsyncThunk(
  "career/fetchDashboard",
  async (_, thunkApi) => {
    try {
      const response = await axiosClient.get("/student-insight/");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail ?? error.message ?? "Fetching dashboard data failed"
        );
      }
      return thunkApi.rejectWithValue("Fetching dashboard data failed");
    }
  }
);

interface DashboardState {
  data: StudentInsight[] | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  data: [],
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

    builder.addCase(
      GenerateDashboardData.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = null;
        if (action.payload && action.payload.salary_range) {
          const current = state.data || [];
          const filtered = current.filter(
            (item) => item.industry?.toLowerCase() !== action.payload.industry?.toLowerCase()
          );
          state.data = [action.payload, ...filtered];
        }
      }
    );

    builder.addCase(GenerateDashboardData.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(FetchDashboardData.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(FetchDashboardData.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = null;
      if (Array.isArray(action.payload)) {
        state.data = action.payload;
      } else if (action.payload && action.payload.salary_range) {
        state.data = [action.payload];
      } else {
        state.data = [];
      }
    });

    builder.addCase(FetchDashboardData.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export default dashboardSlice.reducer;

