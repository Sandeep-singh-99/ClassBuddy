import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export const register = createAsyncThunk(
  "auth/register",
  async (formData: FormData, thunkApi) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
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

export const login = createAsyncThunk("auth/login", async (formData: FormData, thunkApi) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      return thunkApi.rejectWithValue(error.response?.data?.detail || "Login failed");
    }
  }
});

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, thunkApi) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail || "Check auth failed"
        );
      }
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async (_, thunkApi) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/logout`,
      {},
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      return thunkApi.rejectWithValue(error.response?.data?.detail || "Logout failed");
    }
  }
});

interface IUser {
  id: string;
  full_name: string;
  email: string;
  image_url: string;
  imageUrlId: string;
  role: string;
  password?: string;
}

interface AuthState {
  user: IUser | null;
  isLoggedIn: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoggedIn: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
      state.isLoggedIn = true;
      state.error = null;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.error = action.payload as string;
    });
    builder.addCase(login.pending, (state) => {
      state.error = null;
    });

    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.error = null;
    });
    builder.addCase(logout.rejected, (state, action) => {
      state.error = action.payload as string;
    });
    builder.addCase(logout.pending, (state) => {
      state.error = null;
    });

    builder.addCase(
      checkAuth.fulfilled,
      (state, action: PayloadAction<IUser>) => {
        state.user = action.payload;
        state.isLoggedIn = true;
        state.error = null;
      }
    );
    builder.addCase(checkAuth.rejected, (state, action) => {
      state.error = action.payload as string;
      state.user = null;
    });
    builder.addCase(checkAuth.pending, (state) => {
      state.error = null;
    });

    builder.addCase(
      register.fulfilled,
      (state, action: PayloadAction<IUser>) => {
        state.user = action.payload;
        state.isLoggedIn = true;
        state.error = null;
      }
    );
    builder.addCase(register.rejected, (state, action) => {
      state.error = action.payload as string;
    });
    builder.addCase(register.pending, (state) => {
      state.error = null;
    });
  },
});

export default authSlice.reducer;
