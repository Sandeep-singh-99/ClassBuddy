import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slice/authSlice'
import teacherSlice from './slice/tSlice'

export const store = configureStore({
    reducer: {
        auth: authSlice,
        teachers: teacherSlice
    }
})


export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch