import { axiosClient } from "@/helper/axiosClient";
import { oauthService } from "@/services/oauthService";
import type { IUser } from "@/types/user";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

export const register = createAsyncThunk(
  "auth/register",
  async (formData: FormData, thunkApi) => {
    try {
      const response = await axiosClient.post(`/auth/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail ?? error.message ?? "Registration failed"
        );
      }
      return thunkApi.rejectWithValue("Registration failed");
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, thunkApi) => {
    try {
      const response = await oauthService.loginWithOAuth(email, password);
      return response;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail ?? error.message ?? "Login failed"
        );
      }
      const message = error instanceof Error ? error.message : "Login failed";
      return thunkApi.rejectWithValue(message);
    }
  }
);

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, thunkApi) => {
    try {
      const response = await axiosClient.get(`/oauth/userinfo`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.detail ?? error.message ?? "Check auth failed"
        );
      }
      return thunkApi.rejectWithValue("Check auth failed");
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async (_, thunkApi) => {
  try {
    await oauthService.logoutOAuth();
    return { message: "Logged out successfully" };
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      return thunkApi.rejectWithValue(
        error.response?.data?.detail ?? error.message ?? "Logout failed"
      );
    }
    return thunkApi.rejectWithValue("Logout failed");
  }
});

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
  reducers: {
    setUser: (state, action: PayloadAction<IUser | null>) => {
      state.user = action.payload;
      state.isLoggedIn = !!action.payload;
    },
  },
  extraReducers: (builder) => {
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
      state.user = null;
      state.isLoggedIn = false;
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
      state.isLoggedIn = false;
    });
    builder.addCase(checkAuth.pending, (state) => {
      state.error = null;
    });

    builder.addCase(register.fulfilled, (state) => {
      state.error = null;
    });

    builder.addCase(register.rejected, (state, action) => {
      state.error = action.payload as string;
    });
    builder.addCase(register.pending, (state) => {
      state.error = null;
    });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
