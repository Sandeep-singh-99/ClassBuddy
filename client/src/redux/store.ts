import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slice/authSlice'
import teacherSlice from './slice/tSlice'
import noteSlice from './slice/noteSlice'
import interviewSlice from './slice/interviewSlice'

export const store = configureStore({
    reducer: {
        auth: authSlice,
        teachers: teacherSlice,
        interview: interviewSlice,
        notes: noteSlice
    }
})


export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch