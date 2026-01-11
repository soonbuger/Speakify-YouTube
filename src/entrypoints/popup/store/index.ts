import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './settingsSlice';

import { loggerMiddleware } from './loggerMiddleware';

/**
 * Redux Store 설정
 * Redux Toolkit의 configureStore를 사용하여 store 생성
 */
export const store = configureStore({
  reducer: {
    settings: settingsReducer,
  },
  // Chrome Extension 환경에서 직렬화 경고 무시 (storage 객체 관련)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(loggerMiddleware),
  // DevTools에서 스토어 이름 식별 가능하도록 설정
  devTools: {
    name: 'Speakify Popup',
  },
});

// RootState 타입: useSelector에서 사용
export type RootState = ReturnType<typeof store.getState>;

// AppDispatch 타입: useDispatch에서 사용
export type AppDispatch = typeof store.dispatch;
