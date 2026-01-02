import { axiosClient } from "@/helper/axiosClient";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

// Types matching Backend Schemas
interface User {
  id: string;
  full_name: string;
  email: string;
  image_url: string | null;
}

export interface Group {
  id: string;
  group_name: string;
  group_des: string | null;
  image_url: string | null;
  owner: User;
}

export interface Message {
  id: string;
  group_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender: User;
}

interface ChatState {
  groups: Group[];
  messages: Message[];
  activeGroup: Group | null;
  loading: boolean;
  error: string | null;
  messageLoading: boolean;
  sendLoading: boolean;
}

const initialState: ChatState = {
  groups: [],
  messages: [],
  activeGroup: null,
  loading: false,
  error: null,
  messageLoading: false,
  sendLoading: false,
};

// 1. Get Groups
export const fetchGroups = createAsyncThunk(
  "chat/fetchGroups",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/group-messages/get-group");
      return data.groups;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(
          error.response.data.detail ?? error.message ?? "Failed to fetch groups"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

// 2. Get Messages
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (groupId: string, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get(
        `/group-messages/get-messages/${groupId}`
      );
      return data.messages;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(
          error.response.data.detail ?? error.message ?? "Failed to fetch messages"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

// 3. Send Message
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (
    { groupId, message }: { groupId?: string; message: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await axiosClient.post("/group-messages/send-message", {
        group_id: groupId,
        message,
      });
      return data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(
          error.response.data.detail ?? error.message ?? "Failed to send message"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveGroup: (state, action: PayloadAction<Group>) => {
      state.activeGroup = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      // Avoid duplicates from REST + WS race
      if (!state.messages.find((m) => m.id === action.payload.id)) {
        state.messages.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Groups
    builder.addCase(fetchGroups.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchGroups.fulfilled,
      (state, action: PayloadAction<Group[]>) => {
        state.loading = false;
        state.groups = action.payload;
      }
    );
    builder.addCase(fetchGroups.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Messages
    builder.addCase(fetchMessages.pending, (state) => {
      state.messageLoading = true;
      state.error = null;
    });
    builder.addCase(
      fetchMessages.fulfilled,
      (state, action: PayloadAction<Message[]>) => {
        state.messageLoading = false;
        state.messages = action.payload;
      }
    );
    builder.addCase(fetchMessages.rejected, (state, action) => {
      state.messageLoading = false;
      state.error = action.payload as string;
    });

    // Send Message
    builder.addCase(sendMessage.pending, (state) => {
      state.sendLoading = true;
    });
    builder.addCase(
      sendMessage.fulfilled,
      (state, action: PayloadAction<Message>) => {
        state.sendLoading = false;
        // Check for duplicate from WebSocket
        if (!state.messages.find((m) => m.id === action.payload.id)) {
          state.messages.push(action.payload);
        }
      }
    );
    builder.addCase(sendMessage.rejected, (state, action) => {
      state.sendLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setActiveGroup, clearMessages, addMessage } = chatSlice.actions;
export default chatSlice.reducer;
