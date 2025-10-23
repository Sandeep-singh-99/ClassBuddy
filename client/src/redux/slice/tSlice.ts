import { axiosClient } from "@/helper/axiosClient";
import type { TViewAllState } from "@/types/teacher";
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
          error.response?.data?.detail || "Fetching teachers failed"
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
          error.response?.data?.detail || "Joining teacher group failed"
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
          error.response?.data?.detail || "Checking joined status failed"
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
        error.response?.data?.detail || "Fetching group joined students failed"
      );
    }
  }
});

export const generateNotes = createAsyncThunk("teacher/generate-notes", async (title: string, thunkApi) => {
  try {
    const response = await axiosClient.post("/notes/notes-generates", { title: title }, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      }
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      return thunkApi.rejectWithValue(
        error.response?.data?.detail || "Generating notes failed"
      );
    }
  }
})

export const saveNotes = createAsyncThunk("teacher/save-notes", async (formData: FormData, thunkApi) => {
  try {
    const response = await axiosClient.post("/notes/create-note", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      }
    })

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      return thunkApi.rejectWithValue(
        error.response?.data?.detail || "Saving notes failed"
      );
    }
  }
})


export const updateNotes = createAsyncThunk("teacher/update-notes", async (data: { noteId: string; title?: string; content?: string }, thunkApi) => {
  try {
    const response = await axiosClient.put(`/notes/edit-note/${data.noteId}`,{
      title: data.title,
      content: data.content
    }, {
      headers: {
        "Content-Type": "application/json",
      }
    })
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      return thunkApi.rejectWithValue(
        error.response?.data?.detail || "Updating notes failed"
      );
    }
  }
})


interface TState {
  teachers: TViewAllState[];
  joinedStatus: Record<string, boolean>;
  loading: boolean;
  error: string | null;
  generatedNotes?: string | null;
}

const initialState: TState = {
  teachers: [],
  joinedStatus: {},
  loading: false,
  error: null,
  generatedNotes: null,
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
      state.teachers = action.payload;
    });

    builder.addCase(GroupJoinStudents.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(generateNotes.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.generatedNotes = null;
    });

    builder.addCase(generateNotes.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.generatedNotes = action.payload.generated_notes; 
    });

    builder.addCase(generateNotes.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.generatedNotes = null;
    });
  },
});

export default tSlice.reducer;
