import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; 

import authSlice from './slice/authSlice';
import teacherSlice from './slice/tSlice';
import noteSlice from './slice/noteSlice';
import interviewSlice from './slice/interviewSlice';
import docsSlice from './slice/docsSlice';

// 1️⃣ Combine all reducers
const rootReducer = combineReducers({
  auth: authSlice,
  teachers: teacherSlice,
  interview: interviewSlice,
  notes: noteSlice,
  docs: docsSlice,
});

// 2️⃣ Configure persist
const persistConfig = {
  key: 'root',      
  storage,           
  whitelist: ['auth'], 
};

// 3️⃣ Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4️⃣ Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
});

// 5️⃣ Create persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
