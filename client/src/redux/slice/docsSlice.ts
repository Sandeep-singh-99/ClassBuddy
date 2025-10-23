import { axiosClient } from "@/helper/axiosClient";
import type { IDocs } from "@/types/doc";
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
          error.response?.data?.detail || "Generating notes failed"
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
        error.response?.data?.detail || "Generating notes failed"
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
          error.response?.data?.detail || "Generating notes failed"
        );
      }
    }
  }
);

export const DocsStudentFetch = createAsyncThunk(
  "docs/studentFetch",
  async (_, thunkApi) => {
    try {
      const response = await axiosClient.get(
        "/docs/teacher-notes-with-docs"
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail || "Generating notes failed"
        );
      }
    }
  }
);

export const DocsDelete = createAsyncThunk("docs/delete", async (docId: string, thunkApi) => {
  try {
    const response = await axiosClient.delete(`/docs/delete-doc/${docId}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail || "Generating notes failed"
        );
      }
  }
})


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
      state.currentDoc = null;
    });
    builder.addCase(DocsFetchById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentDoc = action.payload;
    });
    builder.addCase(
      DocsFetchById.rejected,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      }
    );

    builder.addCase(DocsStudentFetch.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(DocsStudentFetch.fulfilled, (state, action) => {
      state.loading = false;
      state.docs = action.payload.docsuploads;
    });
    builder.addCase(
      DocsStudentFetch.rejected,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder.addCase(DocsDelete.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(DocsDelete.fulfilled, (state, action) => {
      state.loading = false;
      state.docs = state.docs.filter((doc) => doc.id !== action.meta.arg);
    });

    builder.addCase(
      DocsDelete.rejected,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      }
    );
  },
});

export default docsSlice.reducer;
