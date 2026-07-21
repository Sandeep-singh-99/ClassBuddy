import { axiosClient } from "@/helper/axiosClient";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

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
}

const initialState: InterviewPrepState = {
  loading: false,
  error: null,
  data: null,
};

const interviewSlice = createSlice({
  name: "interview",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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

