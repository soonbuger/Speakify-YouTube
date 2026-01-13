import { useCallback } from 'react';
import { useAppSelector } from '../store/hooks';
import { locales, LocaleKey } from '@/i18n/locales';

/**
 * React용 i18n Hook
 * Redux의 language 상태를 구독하여 언어 변경 시 자동으로 메시지 업데이트
 * (Network Fetch 제거 -> Bundled Locales 사용으로 Firefox 이슈 해결)
 */
export function useI18n() {
  const language = useAppSelector((state) => state.settings.language);
  // messages 상태를 유지할 필요가 없을 수도 있지만, 기존 인터페이스 유지를 위해 그대로 둡니다.
  // 다만, 이제는 동기적으로 로드되므로 useEffect 등이 사실상 필요 없습니다.

  const t = useCallback(
    (key: string, fallback?: string): string => {
      // 1. 현재 언어 팩 가져오기
      const currentLocale = locales[language as keyof typeof locales] || locales.en;

      // 2. 메시지 찾기
      const messageData = currentLocale[key as LocaleKey];

      // 3. 없으면 fallback (JSON 구조상 .message에 텍스트가 있음)
      return messageData?.message || fallback || key;
    },
    [language], // language가 바뀌면 t 함수도 갱신
  );

  return { t, isLoaded: true, language }; // 항상 Loaded 상태
}

export default useI18n;
