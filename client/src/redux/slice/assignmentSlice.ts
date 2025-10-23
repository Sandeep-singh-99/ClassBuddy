import { axiosClient } from "@/helper/axiosClient";
import type { IAssignment } from "@/types/assignment";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

export const fetchAssignments = createAsyncThunk(
  "assignments/fetchAll",
  async (_, thunkApi) => {
    try {
      const response = await axiosClient.get("/assignments/assignments");
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail || "Registration failed"
        );
      }
    }
  }
);

export const fetchAssignmentById = createAsyncThunk(
  "assignments/fetchById",
  async (id: string, thunkApi) => {
    try {
      const response = await axiosClient.get(
        `/assignments/get-assignment-viewById/${id}`
      );
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail || "Registration failed"
        );
      }
    }
  }
);

export const CreateAssignment = createAsyncThunk(
  "assignments/create",
  async (data: FormData, thunkApi) => {
    try {
      const response = await axiosClient.post(
        "/assignments/create-assignment",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail || "Registration failed"
        );
      }
    }
  }
);

export const GenerateAssignmentById = createAsyncThunk(
  "assignments/generate",
  async (id: string, thunkApi) => {
    try {
      const response = await axiosClient.post(
        `/assignments/generate-question/${id}`
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail || "Registration failed"
        );
      }
    }
  }
);

export const DeleteAssignment = createAsyncThunk(
  "assignments/delete",
  async (id: string, thunkApi) => {
    try {
      const response = await axiosClient.delete(
        `/assignments/delete-assignment/${id}`
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail || "Registration failed"
        );
      }
    }
  }
);


interface AssignmentState {
  assignments: IAssignment[];
  currentAssignment: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: AssignmentState = {
  assignments: [],
  currentAssignment: null,
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
    builder.addCase(
      fetchAssignments.fulfilled,
      (state, action: PayloadAction<IAssignment[]>) => {
        state.assignments = action.payload;
        state.loading = false;
        state.error = null;
      }
    );
    builder.addCase(fetchAssignments.rejected, (state, action) => {
      state.loading = false;
      state.assignments = [];
      state.error = action.payload as string;
    });

    builder.addCase(fetchAssignmentById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchAssignmentById.fulfilled,
      (state, action: PayloadAction<IAssignment>) => {
        state.currentAssignment = action.payload;
        state.loading = false;
        state.error = null;
      }
    );

    builder.addCase(fetchAssignmentById.rejected, (state, action) => {
      state.loading = false;
      state.currentAssignment = null;
      state.error = action.payload as string;
    });

    builder.addCase(CreateAssignment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(
      CreateAssignment.fulfilled,
      (state, action: PayloadAction<IAssignment>) => {
        state.assignments = [action.payload, ...state.assignments];
        state.loading = false;
        state.error = null;
      }
    );

    builder.addCase(CreateAssignment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(GenerateAssignmentById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(
      GenerateAssignmentById.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.currentAssignment = action.payload;
        state.loading = false;
        state.error = null;
      }
    );

    builder.addCase(GenerateAssignmentById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(DeleteAssignment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(DeleteAssignment.fulfilled, (state, action) => {
      state.assignments = state.assignments.filter(
        (assignment) => assignment.id !== action.meta.arg
      );
      state.loading = false;
      state.error = null;
    });

    builder.addCase(DeleteAssignment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export default assignmentSlice.reducer;
