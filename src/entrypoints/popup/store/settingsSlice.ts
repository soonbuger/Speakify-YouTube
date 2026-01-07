import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { loadAllSettings, saveAllSettings } from '@/shared/lib/storage';
import { SpeakifySettings, DEFAULT_SETTINGS } from '../../../types';

/**
 * 설정 상태 인터페이스
 */
interface SettingsState extends SpeakifySettings {
  isLoading: boolean;
  isInitialized: boolean;
}

const initialState: SettingsState = {
  ...DEFAULT_SETTINGS,
  isLoading: true,
  isInitialized: false,
};

/**
 * 비동기 Thunk: chrome.storage에서 설정 불러오기
 */
export const fetchSettings = createAsyncThunk('settings/fetchSettings', async () => {
  const settings = await loadAllSettings();
  return settings;
});

/**
 * 비동기 Thunk: chrome.storage에 설정 저장하기
 */
export const persistSettings = createAsyncThunk(
  'settings/persistSettings',
  async (settings: Partial<SpeakifySettings>) => {
    await saveAllSettings(settings);
    return settings;
  }
);

/**
 * Settings Slice
 * Redux Toolkit의 createSlice를 사용하여 reducer와 actions를 동시에 생성
 */
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // 동기 액션: UI 상태만 즉시 업데이트 (저장은 별도 thunk 호출)
    updateSetting: <K extends keyof SpeakifySettings>(
      state: SettingsState,
      action: PayloadAction<{ key: K; value: SpeakifySettings[K] }>
    ) => {
      const { key, value } = action.payload;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (state as any)[key] = value;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchSettings 처리
      .addCase(fetchSettings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
        state.isLoading = false;
        state.isInitialized = true;
      })
      .addCase(fetchSettings.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
      })
      // persistSettings 처리
      .addCase(persistSettings.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      });
  },
});

export const { updateSetting } = settingsSlice.actions;
export default settingsSlice.reducer;

// 타입 재export (App.tsx에서 사용)
export type { SpeakifySettings } from '@/types';
