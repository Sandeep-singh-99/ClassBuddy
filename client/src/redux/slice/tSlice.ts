import { axiosClient } from "@/helper/axiosClient";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

export const viewAllTeacher = createAsyncThunk(
  "teacher/viewAll",
  async (_, thunkApi) => {
    try {
      const response = await axiosClient.get("/insights/teacher-insights");
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data || "Fetching teachers failed"
        );
      }
    }
  }
);

export const joinTeacherGroup = createAsyncThunk(
  "teacher/join",
  async (groupId: string, thunkApi) => {
    try {
      const response = await axiosClient.post(
        "/groups/join",
        { group_id: groupId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data || "Joining teacher group failed"
        );
      }
    }
  }
);

export const JoinedCheckStatus = createAsyncThunk(
  "teacher/joined-or-not",
  async (groupId: string, thunkApi) => {
    try {
      const response = await axiosClient.get(
        `/groups/joined-or-not/${groupId}`
      );
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data || "Checking joined status failed"
        );
      }
    }
  }
);


export const GroupJoinStudents = createAsyncThunk("teacher/group-join-students", async (_ , thunkApi) => {
  try {
    const response = await axiosClient.get("/groups/view-students");
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      return thunkApi.rejectWithValue(
        error.response?.data || "Fetching group joined students failed"
      );
    }
  }
});

interface IOwner {
  id: string;
  full_name: string;
  email: string;
  role: string;
  image_url: string;
  created_at?: string;
  updated_at?: string;
}

interface IMember {
  id: string;
  full_name: string;
  email: string;
  image_url: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

interface TViewAllState {
  id: string;
  group_name: string;
  group_des: string;
  image_url: string;
  owner: IOwner;
  members: IMember[];
  students_count: number;
  created_at?: string;
  updated_at?: string;
}

interface TState {
  teachers: TViewAllState[];
  joinedStatus: Record<string, boolean>;
  loading: boolean;
  error: string | null;
}

const initialState: TState = {
  teachers: [],
  joinedStatus: {},
  loading: false,
  error: null,
};

const tSlice = createSlice({
  name: "teacher",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(viewAllTeacher.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      viewAllTeacher.fulfilled,
      (state, action: PayloadAction<TViewAllState[]>) => {
        state.teachers = action.payload;
        state.loading = false;
        state.error = null;
      }
    );
    builder.addCase(viewAllTeacher.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(JoinedCheckStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(JoinedCheckStatus.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      const { group_id, joined } = action.payload;
      state.joinedStatus[group_id] = joined; 
    });

    builder.addCase(JoinedCheckStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(GroupJoinStudents.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(GroupJoinStudents.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      // Assuming action.payload contains the list of students
      state.teachers = action.payload;
    });

    builder.addCase(GroupJoinStudents.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export default tSlice.reducer;
