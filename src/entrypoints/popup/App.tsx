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
import type { SpeakifySettings } from './store/settingsSlice';

/**
 * Speakify YouTube Settings - 메인 App 컴포넌트
 *
 * @note i18n Fallback Rule: All fallback values must be in ENGLISH.
 *       Example: t('key', 'English Fallback')
 */
function App() {
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
      { value: 'en', label: 'English' },
      { value: 'ko', label: '한국어' },
    ],
    [],
  );

  const positionOptions = useMemo(
    () => [
      { value: 'random', label: t('positionRandom', '랜덤') },
      { value: 'center', label: t('positionCenter', '중앙') },
      { value: 'smart', label: t('positionSmart', '스마트') },
    ],
    [t],
  );

  // 로딩 중이거나 리셋 중일 때 표시
  if (settings.isLoading || !isLoaded || isResetting) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      <h1>{t('settingsTitle', 'Speakify YouTube Settings')}</h1>

      {/* 기본 설정 섹션 */}
      <Section title={t('sectionBasic', 'BASIC')}>
        <Select
          label={t('language', 'Language')}
          value={settings.language}
          onChange={(value) => handleSettingChange('language', value as 'ko' | 'en')}
          options={languageOptions}
        />

        <Toggle
          label={t('enableExtension', 'Enable Extension')}
          checked={settings.extensionEnabled}
          onChange={(value) => handleSettingChange('extensionEnabled', value)}
        />

        <Slider
          label={t('appearChance', 'Appear Chance')}
          value={Math.round(settings.appearChance * 100)}
          onChange={(value) => handleSettingChange('appearChance', value / 100)}
          min={0}
          max={100}
        />

        <Slider
          label={t('flipChance', 'Flip Chance')}
          value={Math.round(settings.flipChance * 100)}
          onChange={(value) => handleSettingChange('flipChance', value / 100)}
          min={0}
          max={100}
        />
      </Section>

      {/* 오버레이 설정 섹션 */}
      <Section title={t('sectionOverlay', 'OVERLAY')}>
        <Select
          label={t('overlayPosition', 'Position')}
          value={settings.overlayPosition}
          onChange={(value) =>
            handleSettingChange('overlayPosition', value as 'center' | 'random' | 'smart')
          }
          options={positionOptions}
        />

        {/* Multi-Image Overlay (Random 모드 전용) - 위치 바로 아래에 들여쓰기 스타일 */}
        {settings.overlayPosition === 'random' && (
          <div className="random-sub-option">
            <DualSlider
              label={t('overlayCount', 'Image Count')}
              minValue={settings.overlayCountMin}
              maxValue={settings.overlayCountMax}
              onMinChange={(value) => handleSettingChange('overlayCountMin', value)}
              onMaxChange={(value) => handleSettingChange('overlayCountMax', value)}
              min={1}
              max={8}
              step={1}
              unit="개"
            />
          </div>
        )}

        {/* Smart Position Sensitivity (Smart 모드 전용) */}
        {settings.overlayPosition === 'smart' && (
          <div className="random-sub-option">
            <Slider
              label={t('smartSensitivity', 'Text Avoidance')}
              value={Math.round(settings.smartSensitivity * 100)}
              onChange={(value) => handleSettingChange('smartSensitivity', value / 100)}
              min={0}
              max={100}
            />
          </div>
        )}

        <DualSlider
          label={t('overlaySize', 'Size')}
          minValue={settings.overlaySizeMin}
          maxValue={settings.overlaySizeMax}
          onMinChange={(value) => handleSettingChange('overlaySizeMin', value)}
          onMaxChange={(value) => handleSettingChange('overlaySizeMax', value)}
          min={10}
          max={150}
        />

        <Slider
          label={t('overlayOpacity', 'Opacity')}
          value={Math.round(settings.overlayOpacity * 100)}
          onChange={(value) => handleSettingChange('overlayOpacity', value / 100)}
          min={10}
          max={100}
          step={10}
        />

        <Toggle
          label={t('colorSync', 'Smart Color Sync')}
          checked={settings.colorSync}
          onChange={(value) => handleSettingChange('colorSync', value)}
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
              step={5}
            />
            <Slider
              label={t('colorSyncStrengthAB', 'Color Tint Intensity')}
              value={Math.round(settings.colorSyncStrengthAB * 100)}
              onChange={(value) => handleSettingChange('colorSyncStrengthAB', value / 100)}
              min={0}
              max={100}
              step={5}
            />
          </>
        )}
      </Section>

      {/* 개발자 옵션 섹션 */}
      <Section title={t('sectionDeveloper', 'DEVELOPER')} className="developer-section">
        <Toggle
          label={t('debugMode', 'Debug Mode')}
          checked={settings.debugMode}
          onChange={(value) => handleSettingChange('debugMode', value)}
        />
        <button className="reset-button" onClick={handleResetToDefaults} type="button">
          {t('resetToDefaults', 'Reset to Defaults')}
        </button>
      </Section>

      <div className="footer">{t('footerAutoSave', 'Settings are saved automatically')}</div>
    </>
  );
}

export default App;
