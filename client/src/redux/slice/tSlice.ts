import { axiosClient } from "@/helper/axiosClient";
import type { TViewAllState } from "@/types/teacher";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

export const viewAllTeacher = createAsyncThunk(
  "teacher/viewAll",
  async (_, thunkApi) => {
    try {
      const response = await axiosClient.get("/insights/");
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail ?? error.message ?? "Fetching teachers failed"
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
        "/groups/",
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
          error.response?.data?.detail ?? error.message ?? "Joining teacher group failed"
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
        `/groups/${groupId}`
      );
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail ?? error.message ?? "Checking joined status failed"
        );
      }
    }
  }
);


export const GroupJoinStudents = createAsyncThunk("teacher/group-join-students", async (_ , thunkApi) => {
  try {
    const response = await axiosClient.get("/groups/");
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      return thunkApi.rejectWithValue(
        error.response?.data?.detail ?? error.message ?? "Fetching group joined students failed"
      );
    }
  }
});



export const getNoteById = createAsyncThunk("teacher/get-note-by-id", async (noteId: string, thunkApi) => {
  try {
    const response = await axiosClient.get(`/notes/${noteId}`);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      return thunkApi.rejectWithValue(
        error.response?.data?.detail ?? error.message ?? "Fetching note failed"
      );
    }
  }
})

export const saveNotes = createAsyncThunk("teacher/save-notes", async (formData: FormData, thunkApi) => {
  try {
    const response = await axiosClient.post("/notes/", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      }
    })

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      return thunkApi.rejectWithValue(
        error.response?.data?.detail ?? error.message ?? "Saving notes failed"
      );
    }
  }
})


export const updateNotes = createAsyncThunk("teacher/update-notes", async (data: { noteId: string; title?: string; content?: string }, thunkApi) => {
  try {
    const response = await axiosClient.put(`/notes/${data.noteId}`,{
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
        error.response?.data?.detail ?? error.message ?? "Updating notes failed"
      );
    }
  }
})


export const fetchTeacherGroupStatus = createAsyncThunk(
  "teacher/fetchGroupStatus",
  async (_, thunkApi) => {
    try {
      const response = await axiosClient.get("/teacher/group-status");
      return response.data as { has_group: boolean; group_count: number };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail ?? error.message ?? "Fetching group status failed"
        );
      }
      return thunkApi.rejectWithValue("Fetching group status failed");
    }
  }
);

interface TState {
  teachers: TViewAllState[];
  joinedStatus: Record<string, boolean>;
  hasGroup: boolean | null;
  groupCount: number;
  loading: boolean;
  error: string | null;
  generatedNotes?: string | null;
  currentNoteId?: string | null;
}

const initialState: TState = {
  teachers: [],
  joinedStatus: {},
  hasGroup: null,
  groupCount: 0,
  loading: false,
  error: null,
  generatedNotes: null,
  currentNoteId: null,
};

const tSlice = createSlice({
  name: "teacher",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setGeneratedNotes: (state, action: PayloadAction<string | null>) => {
      state.generatedNotes = action.payload;
    },
    setCurrentNoteId: (state, action: PayloadAction<string | null>) => {
      state.currentNoteId = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setHasGroup: (state, action: PayloadAction<boolean>) => {
      state.hasGroup = action.payload;
      state.groupCount = action.payload ? Math.max(state.groupCount, 1) : 0;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTeacherGroupStatus.fulfilled, (state, action) => {
      state.hasGroup = action.payload.has_group;
      state.groupCount = action.payload.group_count;
    });
    builder.addCase(fetchTeacherGroupStatus.rejected, (state) => {
      state.hasGroup = false;
      state.groupCount = 0;
    });

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

    builder.addCase(getNoteById.fulfilled, (state, action) => {
      if (action.payload && action.payload.content) {
        state.generatedNotes = action.payload.content;
      }
    });
  },
});

export const { setLoading, setGeneratedNotes, setCurrentNoteId, setError, setHasGroup } = tSlice.actions;

export default tSlice.reducer;

