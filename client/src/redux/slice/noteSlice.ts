import { axiosClient } from "@/helper/axiosClient";
import type { NoteState } from "@/types/note";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

export const teacherNotes = createAsyncThunk(
  "notes/teacher-notes",
  async (_, thunkApi) => {
    try {
      const response = await axiosClient.get("/notes/teacher-get-notes");
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail || "Fetching notes failed"
        );
      }
    }
  }
);

export const teachersGetNoteById = createAsyncThunk(
  "notes/teacher-get-note-by-id",
  async (id: string, thunkApi) => {
    try {
      const response = await axiosClient.get(`/notes/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail || "Fetching note by ID failed"
        );
      }
    }
  }
);

export const deleteNoteById = createAsyncThunk("notes/delete-note-by-id", async (id: string, thunkApi) => {
  try {
    const response = await axiosClient.delete(`/notes/delete-note/${id}`);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      return thunkApi.rejectWithValue(
        error.response?.data?.detail || "Deleting note by ID failed"
      );
    }
  }
})

export const studentJoinGroupNote = createAsyncThunk("notes/student-join-group-note", async (_ , thunkApi) => {
  try {
    const response = await axiosClient.get("/auth/student/notes")
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      return thunkApi.rejectWithValue(
        error.response?.data?.detail || "Joining group note failed"
      );
    }  
  }
})



interface NoteSliceState {
  notes: NoteState[];
  currentNote: NoteState | null;
  count?: number;
  loading: boolean;
  error: string | null;
}

const initialState: NoteSliceState = {
  notes: [],
  currentNote: null,
  count: 0,
  loading: false,
  error: null,
};

const noteSlice = createSlice({
  name: "note",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(teacherNotes.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      teacherNotes.fulfilled,
      (state, action:PayloadAction<{ count: number; notes: NoteState[] }>) => {
        state.notes = action.payload.notes;
        state.count = action.payload.count;
        state.loading = false;
        state.error = null;
      }
    );
    builder.addCase(teacherNotes.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    builder.addCase(teachersGetNoteById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(teachersGetNoteById.fulfilled, (state, action) => {
      state.currentNote = action.payload;
      state.loading = false;
      state.error = null;
    });
    builder.addCase(teachersGetNoteById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(studentJoinGroupNote.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(studentJoinGroupNote.fulfilled, (state, action) => {
      state.notes = action.payload.notes;
      state.count = action.payload.count;
      state.loading = false;
      state.error = null;
    });

    builder.addCase(studentJoinGroupNote.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export default noteSlice.reducer;
