import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// ✅ Import slices
import authSlice from './slice/authSlice';
import teacherSlice from './slice/tSlice';
import noteSlice from './slice/noteSlice';
import interviewSlice from './slice/interviewSlice';
import docsSlice from './slice/docsSlice';
import dashboardSlice from './slice/dashboardSlice';
import assignmentSlice from './slice/assignmentSlice';
import submissionSlice from './slice/submissionSlice';

// ✅ Combine reducers
const rootReducer = combineReducers({
  auth: authSlice,
  teachers: teacherSlice,
  assignments: assignmentSlice,
  dashboard: dashboardSlice,
  submissions: submissionSlice,
  interview: interviewSlice,
  notes: noteSlice,
  docs: docsSlice,
});

// ✅ Persist config — persist only auth data
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
};

// ✅ Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// ✅ Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production', // ✅ Disable Redux DevTools in production
});

// ✅ Create persistor
export const persistor = persistStore(store);

// ✅ Typed hooks (optional but highly recommended)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;