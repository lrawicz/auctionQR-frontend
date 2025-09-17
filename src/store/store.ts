import { configureStore } from '@reduxjs/toolkit';
import contractReducer from './contract/contractSlice';

export const store = configureStore({
  reducer: {
    contract: contractReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
