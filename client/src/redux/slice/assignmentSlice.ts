import { axiosClient } from "@/helper/axiosClient";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";


export const fetchAssignments = createAsyncThunk("assignments/fetchAll", async (_ , thunkApi) => {
    try {
        const response = await axiosClient.get("/assignments/assignments")
        return response.data
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail || "Registration failed"
        );
      }
    }
})

interface IOwner {
  id: string;
  full_name: string;
  email: string;
  role: string;
  image_url: string;
  created_at?: string;
  updated_at?: string;
}

interface IQuestion {
    id: string;
    type: string;
    question: string;
}

interface IAssignment {
    id: string;
    title: string;
    description: string;
    due_date: string;
    owner: IOwner;
    created_at: string;
    updated_at: string;
    questions: IQuestion[];
}

interface AssignmentState {
    assignments: IAssignment[];
    loading: boolean;
    error: string | null;
}

const initialState: AssignmentState = {
    assignments: [],
    loading: false,
    error: null,
};


const assignmentSlice = createSlice({
    name: "assignments",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchAssignments.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchAssignments.fulfilled, (state, action: PayloadAction<IAssignment[]>) => {
            state.assignments = action.payload;
            state.loading = false;
            state.error = null;
        });
        builder.addCase(fetchAssignments.rejected, (state, action) => {
            state.loading = false;
            state.assignments = []
            state.error = action.payload as string;
        });
    }
})

export default assignmentSlice.reducer;