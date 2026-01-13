import React, { useEffect, useMemo, useCallback } from 'react';
import Section from './components/Section';
import Toggle from './components/Toggle';
import Slider from './components/Slider';
import DualSlider from './components/DualSlider';
import Select from './components/Select';
import { useAppDispatch, useAppSelector } from './store/hooks';
import {
  fetchSettings,
  persistSettings,
  updateSetting,
  resetToDefaults,
} from './store/settingsSlice';
import { useI18n } from './hooks/useI18n';
import type { SpeakifySettings, OverlayPosition } from './store/settingsSlice';

/**
 * Speakify YouTube Settings - 메인 App 컴포넌트
 *
 * @note i18n Fallback Rule: All fallback values must be in ENGLISH.
 *       Example: t('key', 'English Fallback')
 */
function App() {
  console.log('🚀 App Component Rendering'); // Debug Log
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const { t, isLoaded } = useI18n();

  // 컴포넌트 마운트 시 Storage에서 설정 불러오기
  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  // Reset 중인지 여부 (Flash Reset: UI를 잠시 언마운트하여 상태 완전 초기화)
  const [isResetting, setIsResetting] = React.useState(false);

  /**
   * 설정 변경 핸들러
   */
  const handleSettingChange = useCallback(
    <K extends keyof SpeakifySettings>(key: K, value: SpeakifySettings[K]) => {
      dispatch(updateSetting({ key, value }));
      dispatch(persistSettings({ [key]: value }));
    },
    [dispatch],
  );

  /**
   * 기본값으로 초기화 핸들러
   */
  const handleResetToDefaults = useCallback(() => {
    // 1. 리셋 시작: UI 언마운트
    setIsResetting(true);

    // 2. 상태 초기화
    dispatch(resetToDefaults());

    // 3. Storage 저장
    import('@/types').then(({ DEFAULT_SETTINGS }) => {
      dispatch(persistSettings(DEFAULT_SETTINGS));
    });

    // 4. 짧은 딜레이 후 UI 리마운트 (Race Condition 및 Layout Thrashing 방지)
    setTimeout(() => {
      setIsResetting(false);
    }, 50);
  }, [dispatch]);

  // 옵션 목록 (i18n 적용) - useMemo로 참조 안정성 확보
  const languageOptions = useMemo(
    () => [
      { value: 'en', label: 'English', className: 'font-one-mobile' },
      { value: 'ko', label: '한국어', className: 'font-one-mobile' },
      { value: 'ja', label: '日本語', className: 'font-mochiy' },
    ],
    [],
  );

  const positionOptions = useMemo(
    () => [
      { value: 'random', label: t('positionRandom', '랜덤') },
      { value: 'smart', label: t('positionSmart', '스마트') },
      { value: 'center', label: t('positionCenter', '중앙') },
      { value: 'top-left', label: t('positionTopLeft', '좌측 상단') },
      { value: 'top-right', label: t('positionTopRight', '우측 상단') },
      { value: 'bottom-right', label: t('positionBottomRight', '우측 하단') },
      { value: 'bottom-left', label: t('positionBottomLeft', '좌측 하단') },
    ],
    [t],
  );

  // 로딩 중이거나 리셋 중일 때 표시
  if (settings.isLoading || !isLoaded || isResetting) {
    return (
      <div className="flex justify-center items-center h-screen text-text-sub">Loading...</div>
    );
  }

  // 일본어는 Mochiy Pop One, 그외는 ONE Mobile 폰트 클래스
  const fontClass = settings.language === 'ja' ? 'font-mochiy' : 'font-one-mobile';

  return (
    <main className={`w-[320px] min-h-screen p-4 bg-background text-text ${fontClass}`}>
      <h1 className="text-lg font-semibold mb-3 flex items-center gap-2 text-text shadow-none font-one-mobile">
        {t('settingsTitle', 'Speakify YouTube Settings')}
      </h1>

      {/* 기본 설정 섹션 */}
      <Section title={t('sectionBasic', 'BASIC')}>
        <Select
          label={t('language', 'Language')}
          value={settings.language}
          onChange={(value) => handleSettingChange('language', value as 'ko' | 'en' | 'ja')}
          options={languageOptions}
          className="mb-3.5"
        />

        <Toggle
          label={t('enableExtension', 'Enable Extension')}
          checked={settings.extensionEnabled}
          onChange={(value) => handleSettingChange('extensionEnabled', value)}
          className="mb-3.5"
        />

        <Slider
          label={t('appearChance', 'Appear Chance')}
          value={Math.round(settings.appearChance * 100)}
          onChange={(value) => handleSettingChange('appearChance', value / 100)}
          min={0}
          max={100}
          step={1}
          unit={t('unitPercent', '%')}
          className="mb-2.5"
        />

        <Slider
          label={t('flipChance', 'Flip Chance')}
          value={Math.round(settings.flipChance * 100)}
          onChange={(value) => handleSettingChange('flipChance', value / 100)}
          min={0}
          max={100}
          step={1}
          unit={t('unitPercent', '%')}
          className="mb-0"
        />
      </Section>

      {/* 오버레이 설정 섹션 */}
      <Section title={t('sectionOverlay', 'OVERLAY')}>
        <Select
          label={t('overlayPosition', 'Position')}
          value={settings.overlayPosition}
          onChange={(value) => handleSettingChange('overlayPosition', value as OverlayPosition)}
          options={positionOptions}
          className="mb-3.5"
        />

        {/* Multi-Image Overlay (Random 모드 전용) - 위치 바로 아래에 들여쓰기 스타일 */}
        {settings.overlayPosition === 'random' && (
          <div className="random-sub-option">
            <DualSlider
              label={t('overlayCount', 'Image Count')}
              minValue={settings.overlayCountMin}
              maxValue={settings.overlayCountMax}
              onChange={(min, max) => {
                handleSettingChange('overlayCountMin', min);
                handleSettingChange('overlayCountMax', max);
              }}
              min={1}
              max={8}
              step={1}
              unit={t('unitCount', 'ea')}
              className="mb-2.5"
            />
          </div>
        )}

        <DualSlider
          label={t('overlaySize', 'Size')}
          minValue={settings.overlaySizeMin}
          maxValue={settings.overlaySizeMax}
          onChange={(min, max) => {
            handleSettingChange('overlaySizeMin', min);
            handleSettingChange('overlaySizeMax', max);
          }}
          min={10}
          max={150}
          step={1}
          unit={t('unitPercent', '%')}
          className="mb-2.5"
        />

        <DualSlider
          label={t('overlayRotation', 'Rotation')}
          minValue={settings.rotationMin}
          maxValue={settings.rotationMax}
          onChange={(min, max) => {
            handleSettingChange('rotationMin', min);
            handleSettingChange('rotationMax', max);
          }}
          min={0}
          max={180}
          step={1}
          unit={t('unitDegree', '°')}
          className="mb-2.5"
        />

        <Slider
          label={t('overlayOpacity', 'Opacity')}
          value={Math.round(settings.overlayOpacity * 100)}
          onChange={(value) => handleSettingChange('overlayOpacity', value / 100)}
          min={10}
          max={100}
          step={1}
          unit={t('unitPercent', '%')}
          className="mb-2.5"
        />

        <Toggle
          label={t('colorSync', 'Smart Color Sync')}
          checked={settings.colorSync}
          onChange={(value) => handleSettingChange('colorSync', value)}
          className={settings.colorSync ? 'mb-3.5' : 'mb-0'}
        />

        {/* Color Sync 세부 설정 (활성화 시에만 표시) */}
        {settings.colorSync && (
          <>
            <Slider
              label={t('colorSyncStrengthL', 'Lighting Intensity')}
              value={Math.round(settings.colorSyncStrengthL * 100)}
              onChange={(value) => handleSettingChange('colorSyncStrengthL', value / 100)}
              min={0}
              max={100}
              step={1}
              unit={t('unitPercent', '%')}
              className="mb-2.5"
            />
            <Slider
              label={t('colorSyncStrengthAB', 'Color Tint Intensity')}
              value={Math.round(settings.colorSyncStrengthAB * 100)}
              onChange={(value) => handleSettingChange('colorSyncStrengthAB', value / 100)}
              min={0}
              max={100}
              step={1}
              unit={t('unitPercent', '%')}
              className="mb-0"
            />
          </>
        )}
      </Section>

      {/* 개발자 옵션 섹션 */}
      <Section title={t('sectionDeveloper', 'DEVELOPER')}>
        <Toggle
          label={t('debugMode', 'Debug Mode')}
          checked={settings.debugMode}
          onChange={(value) => handleSettingChange('debugMode', value)}
          className="mb-0"
        />
        <button
          className="w-full mt-4 py-2.5 px-4 text-[13px] font-medium text-text-sub bg-white border border-gray-200/80 rounded-[12px] cursor-pointer transition-all hover:text-primary hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm active:scale-[0.98]"
          onClick={handleResetToDefaults}
          type="button"
        >
          {t('resetToDefaults', 'Reset to Defaults')}
        </button>
      </Section>

      <div className="mt-5 pt-3 text-[11px] text-text-muted text-center border-t border-white/80">
        {t('footerAutoSave', 'Settings are saved automatically')}
      </div>
    </main>
  );
}

export default App;
