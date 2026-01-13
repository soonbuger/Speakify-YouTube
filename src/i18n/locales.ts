import koMessages from '../../public/_locales/ko/messages.json';
import enMessages from '../../public/_locales/en/messages.json';
import jaMessages from '../../public/_locales/ja/messages.json';
/**
 * 파이어폭스 호환성 문제로 만들어놓음
 */

// JSON 파일의 구조 타입 정의
interface MessageSchema {
  [key: string]: {
    message: string;
    description?: string;
  };
}

// 각 언어별 메시지를 매핑
export const locales = {
  ko: koMessages as MessageSchema,
  en: enMessages as MessageSchema,
  ja: jaMessages as MessageSchema,
} as const;

export type LocaleKey = keyof typeof locales.ko;
