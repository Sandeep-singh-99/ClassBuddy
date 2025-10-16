import { axiosClient } from "@/helper/axiosClient";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

export const SubmitSubmission = createAsyncThunk(
  "submission/submit",
  async ({ id, data }: { id: string; data: Record<string, any> }, thunkApi) => {
    try {
      const response = await axiosClient.post(
        `/ai-evaluator/${id}/evaluate`,
        data
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail || "Fetching notes failed"
        );
      }
    }
  }
);

export const fetchSubmissionResult = createAsyncThunk("submission/fetchResult", async (id: string, thunkApi) => {
  try {
    const response = await axiosClient.get(`/submissions/student-view/${id}`)
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail || "Fetching notes failed"
        );
      }
  }
})

export const fetchAssignmentStats = createAsyncThunk("submission/fetchStats", async (id: string, thunkApi) => {
  try {
    const response = await axiosClient.get(`/submissions/assignment-stats/${id}`)
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail || "Fetching notes failed"
        );
      }
  }
})

export const fetchAllStudentSubmissions = createAsyncThunk("submission/fetchAllStudentSubmissions", async (id: string, thunkApi) => {
  try {
    const response = await axiosClient.get(`/submissions/assignment-marks/${id}`)
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail || "Fetching notes failed"
        );
      }
  }
})

interface SubmissionState {
  loading: boolean;
  error: string | null;
  result: any | null;
  submissionResult?: any | null;
}

const initialState: SubmissionState = {
  loading: false,
  error: null,
  result: null,
  submissionResult: null,
};

const submissionSlice = createSlice({
  name: "submission",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(SubmitSubmission.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.result = null;
    });
    builder.addCase(
      SubmitSubmission.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.result = action.payload;
      }
    );

    builder.addCase(SubmitSubmission.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchSubmissionResult.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.submissionResult = null;
    });

    builder.addCase(
      fetchSubmissionResult.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.submissionResult = action.payload.submissions?.[0] || null;
      }
    );

    builder.addCase(fetchSubmissionResult.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export default submissionSlice.reducer;
