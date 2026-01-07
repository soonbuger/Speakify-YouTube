import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '../store/hooks';

/**
 * i18n 메시지 타입
 */
interface I18nMessages {
  [key: string]: {
    message: string;
    description?: string;
  };
}

/**
 * 메시지 캐시 (언어별로 한 번만 로드)
 */
const messageCache: Record<string, I18nMessages> = {};

/**
 * 메시지 파일 로드
 */
async function loadMessages(language: string): Promise<I18nMessages> {
  if (messageCache[language]) {
    return messageCache[language];
  }

  try {
    const url = browser.runtime.getURL(`_locales/${language}/messages.json`);
    const response = await fetch(url);
    const messages = await response.json();
    messageCache[language] = messages;
    return messages;
  } catch (error) {
    console.error(`[i18n] Failed to load messages for ${language}:`, error);
    return {};
  }
}

/**
 * React용 i18n Hook
 * Redux의 language 상태를 구독하여 언어 변경 시 자동으로 메시지 업데이트
 */
export function useI18n() {
  const language = useAppSelector((state) => state.settings.language);
  const [messages, setMessages] = useState<I18nMessages>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // 언어가 변경될 때마다 메시지 파일 로드
  useEffect(() => {
    let isMounted = true;

    loadMessages(language).then((loadedMessages) => {
      if (isMounted) {
        setMessages(loadedMessages);
        setIsLoaded(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [language]);

  /**
   * 메시지 키로 번역된 텍스트 가져오기
   * @param key 메시지 키 (예: 'settingsTitle')
   * @param fallback 메시지가 없을 때 기본값
   */
  const t = useCallback(
    (key: string, fallback?: string): string => {
      const message = messages[key]?.message;
      return message || fallback || key;
    },
    [messages]
  );

  return { t, isLoaded, language };
}

export default useI18n;
