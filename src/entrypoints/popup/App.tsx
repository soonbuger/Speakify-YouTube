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
    dispatch(resetToDefaults());
    // Storage에도 저장
    import('@/types').then(({ DEFAULT_SETTINGS }) => {
      dispatch(persistSettings(DEFAULT_SETTINGS));
    });
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
      { value: 'center', label: t('positionCenter', '중앙') },
      { value: 'random', label: t('positionRandom', '랜덤') },
      { value: 'smart', label: t('positionSmart', '스마트') },
    ],
    [t],
  );

  // 로딩 중일 때 표시
  if (settings.isLoading || !isLoaded) {
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

        {/* Multi-Image Overlay (Random 모드 전용) */}
        {settings.overlayPosition === 'random' && (
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
