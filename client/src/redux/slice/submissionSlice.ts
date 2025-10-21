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

export const fetchSubmissionResult = createAsyncThunk(
  "submission/fetchResult",
  async (id: string, thunkApi) => {
    try {
      const response = await axiosClient.get(`/submissions/student-view/${id}`);
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

export const fetchAssignmentStats = createAsyncThunk(
  "submission/fetchStats",
  async (id: string, thunkApi) => {
    try {
      const response = await axiosClient.get(
        `/submissions/assignment-stats/${id}`
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

export const fetchAllStudentSubmissions = createAsyncThunk(
  "submission/fetchAllStudentSubmissions",
  async (id: string, thunkApi) => {
    try {
      const response = await axiosClient.get(
        `/submissions/assignment-marks/${id}`
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

export const totalSubmission = createAsyncThunk(
  "submission/totalSubmission",
  async (_, thunkApi) => {
    try {
      const response = await axiosClient.get("/submissions/total-submissions");
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

export const studentSubmissionStats = createAsyncThunk(
  "submission/studentSubmissionStats",
  async (_, thunkApi) => {
    try {
      const response = await axiosClient.get(
        "/submissions/student-submissions-stats"
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

export const fetchStudentAssignmentStats = createAsyncThunk(
  "submission/fetchStudentAssignmentStats",
  async (_, thunkApi) => {
    try {
      const response = await axiosClient.get(
        "/submissions/student/assignments"
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


export const fetchStudentPerformanceStats = createAsyncThunk("submission/fetchStudentPerformanceStats", async (_, thunkApi) => {
  try {
    const response = await axiosClient.get("/submissions/student-performance-stats");
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
  stats: any | null;
  studentData: any[] | null;
  totalSubmissions: number | null;
  studentAssignmentStats: any | null;
  ownerAssignmentStats: any[] | null;
  performanceStats: any | null;
}

const initialState: SubmissionState = {
  loading: false,
  error: null,
  result: null,
  submissionResult: null,
  stats: null,
  studentData: null,
  totalSubmissions: null,
  studentAssignmentStats: null,
  ownerAssignmentStats: null,
  performanceStats: null,
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

    builder.addCase(fetchAssignmentStats.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.stats = null;
    });

    builder.addCase(
      fetchAssignmentStats.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.stats = action.payload;
      }
    );

    builder.addCase(fetchAssignmentStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchAllStudentSubmissions.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.studentData = null;
    });

    builder.addCase(
      fetchAllStudentSubmissions.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.studentData = action.payload;
      }
    );

    builder.addCase(fetchAllStudentSubmissions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(totalSubmission.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.totalSubmissions = null;
    });

    builder.addCase(
      totalSubmission.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.totalSubmissions = action.payload.total_submissions;
      }
    );

    builder.addCase(totalSubmission.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(studentSubmissionStats.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.studentAssignmentStats = null;
    });

    builder.addCase(
      studentSubmissionStats.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.studentAssignmentStats = action.payload;
      }
    );

    builder.addCase(studentSubmissionStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.studentAssignmentStats = null;
    });

    builder.addCase(fetchStudentAssignmentStats.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.ownerAssignmentStats = null;
    });

    builder.addCase(
      fetchStudentAssignmentStats.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.ownerAssignmentStats = action.payload;
      }
    );

    builder.addCase(fetchStudentAssignmentStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.ownerAssignmentStats = null;
    });

    builder.addCase(fetchStudentPerformanceStats.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.performanceStats = null;
    });

    builder.addCase(
      fetchStudentPerformanceStats.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.performanceStats = action.payload;
      }
    );

    builder.addCase(fetchStudentPerformanceStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.performanceStats = null;
    });
  },
});

export default submissionSlice.reducer;
