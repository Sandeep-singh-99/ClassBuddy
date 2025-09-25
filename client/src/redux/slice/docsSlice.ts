import { axiosClient } from "@/helper/axiosClient";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

export const DocsUpload = createAsyncThunk(
  "docs/upload",
  async (data: { filename: string; file: File | null }, thunkApi) => {
    try {
      const response = await axiosClient.post("/docs/upload-doc", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data || "Generating notes failed"
        );
      }
    }
  }
);

export const DocsFetch = createAsyncThunk("docs/fetch", async (_, thunkApi) => {
  try {
    const response = await axiosClient.get("/docs/my-docs");
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return thunkApi.rejectWithValue(
        error.response?.data || "Generating notes failed"
      );
    }
  }
});

export const DocsFetchById = createAsyncThunk(
  "docs/fetchById",
  async (docId: string, thunkApi) => {
    try {
      const response = await axiosClient.get(`/docs/my-docs/${docId}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data || "Generating notes failed"
        );
      }
    }
  }
);

interface IDocs {
  id?: string;
  filename?: string;
  file_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface DocsState {
  docs: IDocs[];
  currentDoc: IDocs | null;
  loading: boolean;
  error: string | null;
}

const initialState: DocsState = {
  docs: [],
  currentDoc: null,
  loading: false,
  error: null,
};

const docsSlice = createSlice({
  name: "docs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(DocsUpload.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(DocsUpload.fulfilled, (state, action) => {
      state.loading = false;
      state.docs = [...state.docs, action.payload];
    });
    builder.addCase(
      DocsUpload.rejected,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      }
    );
    builder.addCase(DocsFetch.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(DocsFetch.fulfilled, (state, action) => {
      state.loading = false;
      state.docs = action.payload;
    });
    builder.addCase(DocsFetch.rejected, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    });

    builder.addCase(DocsFetchById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(DocsFetchById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentDoc = action.payload;
    });
    builder.addCase(DocsFetchById.rejected, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export default docsSlice.reducer;
