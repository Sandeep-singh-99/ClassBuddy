import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slice/authSlice'
import teacherSlice from './slice/tSlice'
import noteSlice from './slice/noteSlice'

export const store = configureStore({
    reducer: {
        auth: authSlice,
        teachers: teacherSlice,
        notes: noteSlice
    }
})


export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch