import { axiosClient } from "@/helper/axiosClient";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

export const InterviewPrepCreate = createAsyncThunk(
  "interview/create",
  async (data: { name: string; description: string }, thunkApi) => {
    try {
      const response = await axiosClient.post(
        "/interview-prep/create-interview-prep",
        data
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail || "Fetching interview prep failed"
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
        "/interview-prep/get-interview-preps"
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail || "Fetching interview prep failed"
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
          state.data = action.payload;
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
      );
  },
});

export default interviewSlice.reducer;
