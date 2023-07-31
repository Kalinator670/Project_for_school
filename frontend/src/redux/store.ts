import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { authApi } from './api/authApi';
import userReducer from './features/userSlice';
import { projectsApi } from './api/projectsApi';
import { taskApi } from './api/taskApi';
import { userApi } from './api/userApi';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [projectsApi.reducerPath]: projectsApi.reducer,
    [taskApi.reducerPath]: taskApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    userState: userReducer,
  },
  devTools: true,
  middleware: (getDefaultMiddleware) =>getDefaultMiddleware().concat([authApi.middleware, userApi.middleware, projectsApi.middleware, taskApi.middleware])
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
