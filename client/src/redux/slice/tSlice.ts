import { axiosClient } from "@/helper/axiosClient";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

export const viewAllTeacher = createAsyncThunk("teacher/viewAll", async (_ , thunkApi) => {
    try {
        const response = await axiosClient.get("/insights/teacher-insights")
        return response.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            return thunkApi.rejectWithValue(error.response?.data || "Fetching teachers failed");
        }
    }
})

export const joinTeacherGroup = createAsyncThunk("teacher/join", async (groupId: string, thunkApi) => {
    try {
        const response = await axiosClient.post("/groups/join", { group_id: groupId }, {
            headers: {
                "Content-Type": "application/json",
            }
        });
        return response.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            return thunkApi.rejectWithValue(error.response?.data || "Joining teacher group failed");
        }
    }
})

interface IOwner {
    id: string;
    full_name: string;
    email: string;
    role: string;
    image_url: string;
    created_at?: string;
    updated_at?: string;
}

interface IMember {
    id: string;
    full_name: string;
    email: string;
    image_url: string;
    role: string;
    created_at?: string;
    updated_at?: string;
}

interface TViewAllState {
    id: string;
    group_name: string;
    group_des: string;
    image_url: string;
    owner: IOwner;
    members: IMember[];
    created_at?: string;
    updated_at?: string;
}

interface TState {
    teachers: TViewAllState[];
    loading: boolean;
    error: string | null;
}

const initialState: TState = {
    teachers: [],
    loading: false,
    error: null,
}


const tSlice = createSlice({
    name: "teacher",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(viewAllTeacher.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(viewAllTeacher.fulfilled, (state, action: PayloadAction<TViewAllState[]>) => {
            state.teachers = action.payload;
            state.loading = false;
            state.error = null;
        });
        builder.addCase(viewAllTeacher.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    }
})

export default tSlice.reducer;