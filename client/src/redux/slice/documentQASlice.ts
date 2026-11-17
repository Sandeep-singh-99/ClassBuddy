import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { documentQAService, qaErrorMessage } from "@/services/documentQAService";
import type { DocumentQAState, QAAnswer, QAClassroom, QADocument, QAQuestion } from "@/types/documentQA";

export const fetchQAClassrooms = createAsyncThunk<QAClassroom[], void, { rejectValue: string }>(
  "documentQA/groups", async (_, { signal, rejectWithValue }) => {
    try { return await documentQAService.groups(signal); }
    catch (error) { return rejectWithValue(qaErrorMessage(error)); }
  },
);
export const fetchQADocuments = createAsyncThunk<QADocument[], string, { rejectValue: string }>(
  "documentQA/documents", async (groupId, { signal, rejectWithValue }) => {
    try { return await documentQAService.documents(groupId, signal); }
    catch (error) { return rejectWithValue(qaErrorMessage(error)); }
  },
);
export const askDocumentQuestion = createAsyncThunk<QAAnswer, QAQuestion, { rejectValue: string }>(
  "documentQA/ask", async (question, { signal, rejectWithValue }) => {
    try { return await documentQAService.ask(question, signal); }
    catch (error) { return rejectWithValue(qaErrorMessage(error)); }
  },
);
export const retryDocumentIndex = createAsyncThunk<QADocument, { groupId: string; documentId: string }, { rejectValue: string }>(
  "documentQA/retry", async ({ documentId }, { signal, rejectWithValue }) => {
    try { return await documentQAService.retry(documentId, signal); }
    catch (error) { return rejectWithValue(qaErrorMessage(error)); }
  },
);

const initialState: DocumentQAState = {
  groups: [], groupId: "", documents: [], answer: null, question: "",
  groupsLoading: false, documentsLoading: false, asking: false, retryingId: null,
  groupsError: null, documentsError: null, answerError: null,
};

const documentQASlice = createSlice({
  name: "documentQA", initialState,
  reducers: {
    resetQA: () => initialState,
    selectQAClassroom(state, action: PayloadAction<string>) {
      state.groupId = action.payload;
      state.documents = [];
      state.answer = null;
      state.question = "";
      state.asking = false;
      state.retryingId = null;
      state.documentsError = null;
      state.answerError = null;
      state.answerRequestId = undefined;
      state.documentsRequestId = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQAClassrooms.pending, (state, action) => {
        state.groupsLoading = true;
        state.groupsError = null;
        state.groupsRequestId = action.meta.requestId;
      })
      .addCase(fetchQAClassrooms.fulfilled, (state, action) => {
        if (state.groupsRequestId !== action.meta.requestId) return;
        state.groupsLoading = false;
        state.groups = action.payload;
      })
      .addCase(fetchQAClassrooms.rejected, (state, action) => {
        if (state.groupsRequestId !== action.meta.requestId) return;
        state.groupsLoading = false;
        if (!action.meta.aborted) state.groupsError = action.payload ?? "Could not load classrooms.";
      })
      .addCase(fetchQADocuments.pending, (state, action) => {
        state.documentsLoading = true;
        state.documentsError = null;
        state.documentsRequestId = action.meta.requestId;
      })
      .addCase(fetchQADocuments.fulfilled, (state, action) => {
        if (state.groupId !== action.meta.arg || state.documentsRequestId !== action.meta.requestId) return;
        state.documents = action.payload;
        state.documentsLoading = false;
      })
      .addCase(fetchQADocuments.rejected, (state, action) => {
        if (state.groupId !== action.meta.arg || state.documentsRequestId !== action.meta.requestId) return;
        state.documentsLoading = false;
        if (!action.meta.aborted) state.documentsError = action.payload ?? "Could not load documents.";
      })
      .addCase(askDocumentQuestion.pending, (state, action) => {
        state.asking = true;
        state.answer = null;
        state.answerError = null;
        state.question = action.meta.arg.question;
        state.answerRequestId = action.meta.requestId;
      })
      .addCase(askDocumentQuestion.fulfilled, (state, action) => {
        if (state.groupId !== action.meta.arg.groupId || state.answerRequestId !== action.meta.requestId) return;
        state.asking = false;
        state.answer = action.payload;
      })
      .addCase(askDocumentQuestion.rejected, (state, action) => {
        if (state.groupId !== action.meta.arg.groupId || state.answerRequestId !== action.meta.requestId) return;
        state.asking = false;
        if (!action.meta.aborted) state.answerError = action.payload ?? "Could not answer your question.";
      })
      .addCase(retryDocumentIndex.pending, (state, action) => {
        state.retryingId = action.meta.arg.documentId;
        state.documentsError = null;
      })
      .addCase(retryDocumentIndex.fulfilled, (state, action) => {
        if (state.groupId !== action.meta.arg.groupId) return;
        state.retryingId = null;
        state.documents = state.documents.map(doc => doc.id === action.payload.id ? action.payload : doc);
      })
      .addCase(retryDocumentIndex.rejected, (state, action) => {
        if (state.groupId !== action.meta.arg.groupId) return;
        state.retryingId = null;
        state.documentsError = action.payload ?? "Could not retry indexing.";
      });
  },
});

export const { resetQA, selectQAClassroom } = documentQASlice.actions;
export default documentQASlice.reducer;
