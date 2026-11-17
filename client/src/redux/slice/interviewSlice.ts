import { axiosClient } from "@/helper/axiosClient";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import type { QuizReview } from "@/types/quiz";

export const fetchInterviewReview = createAsyncThunk<QuizReview, string, { rejectValue: string }>(
  "interview/review", async (id, { rejectWithValue }) => {
    try { return (await axiosClient.get<QuizReview>(`/interview-prep/${id}/result`)).data; }
    catch (error) {
      return rejectWithValue(error instanceof AxiosError && typeof error.response?.data?.detail === "string"
        ? error.response.data.detail : "Could not load quiz results. Please retry.");
    }
  },
);

export const InterviewPrepCreate = createAsyncThunk(
  "interview/create",
  async (data: { name: string; description: string }, thunkApi) => {
    try {
      const response = await axiosClient.post(
        "/interview-prep/",
        data
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail ?? error.message ?? "Fetching interview prep failed"
        );
      }
    }
  }
);

export const GetAllInterviewPrep = createAsyncThunk(
  "interview/getAll",
  async (_, thunkApi) => {
    try {
      const response = await axiosClient.get(
        "/interview-prep/"
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail ?? error.message ?? "Fetching interview prep failed"
        );
      }
    }
  }
);

export const GetInterviewQuestion = createAsyncThunk("interview/getInterviewQuestion", async (id: string, thunkApi) => {
  try {
    const response = await axiosClient.get(`/interview-prep/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail ?? error.message ?? "Fetching interview question failed"
        );
      }
  }
})

export const DeleteInterviewPrep = createAsyncThunk(
  "interview/delete",
  async (id: string, thunkApi) => {
    try {
      const response = await axiosClient.delete(`/interview-prep/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail ?? error.message ?? "Deleting interview prep failed"
        );
      }
    }
  }
);

interface InterviewPrepState {
  loading: boolean;
  error: string | null;
  data: any | null;
  review: QuizReview | null;
  reviewLoading: boolean;
  reviewError: string | null;
  reviewRequestId?: string;
}

const initialState: InterviewPrepState = {
  loading: false,
  error: null,
  data: null,
  review: null,
  reviewLoading: false,
  reviewError: null,
};

const interviewSlice = createSlice({
  name: "interview",
  initialState,
  reducers: {
    setQuizReview(state, action: PayloadAction<QuizReview | null>) {
      state.review = action.payload;
      state.reviewError = null;
      state.reviewLoading = false;
      state.reviewRequestId = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInterviewReview.pending, (state, action) => {
        state.review = null; state.reviewLoading = true; state.reviewError = null; state.reviewRequestId = action.meta.requestId;
      })
      .addCase(fetchInterviewReview.fulfilled, (state, action) => {
        if (state.reviewRequestId !== action.meta.requestId) return;
        state.review = action.payload; state.reviewLoading = false;
      })
      .addCase(fetchInterviewReview.rejected, (state, action) => {
        if (state.reviewRequestId !== action.meta.requestId) return;
        state.reviewLoading = false; state.reviewError = action.payload ?? "Could not load quiz results.";
      })
      .addCase(InterviewPrepCreate.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        InterviewPrepCreate.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          if (Array.isArray(state.data)) {
            state.data = [action.payload, ...state.data];
          } else {
            state.data = action.payload;
          }
        }
      )
      .addCase(
        InterviewPrepCreate.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

      .addCase(GetAllInterviewPrep.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        GetAllInterviewPrep.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.data = action.payload;
        }
      )
      .addCase(
        GetAllInterviewPrep.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )
      .addCase(GetInterviewQuestion.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        GetInterviewQuestion.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.data = action.payload;
        }
      )
      .addCase(
        GetInterviewQuestion.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )
      .addCase(
        DeleteInterviewPrep.fulfilled,
        (state, action: PayloadAction<any>) => {
          if (Array.isArray(state.data) && action.payload?.id) {
            state.data = state.data.filter((item: any) => item.id !== action.payload.id);
          }
        }
      );
  },
});

export default interviewSlice.reducer;
export const { setQuizReview } = interviewSlice.actions;

