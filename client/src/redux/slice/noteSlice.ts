import { axiosClient } from "@/helper/axiosClient";
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
          error.response?.data || "Fetching notes failed"
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
          error.response?.data || "Fetching note by ID failed"
        );
      }
    }
  }
);

interface NoteState {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
}

interface NoteSliceState {
  notes: NoteState[];
  currentNote: NoteState | null;
  loading: boolean;
  error: string | null;
}

const initialState: NoteSliceState = {
  notes: [],
  currentNote: null,
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
      (state, action: PayloadAction<NoteState[]>) => {
        state.notes = action.payload;
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
  },
});

export default noteSlice.reducer;
