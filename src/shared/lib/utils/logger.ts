/**
 * YouTube Speakify - Logger Utility
 * 브라우저 환경 전용 로깅 유틸리티
 *
 * ⚠️ 기본적으로 로그가 비활성화됨 (debugMode: false)
 * Logger.setEnabled(true)를 호출해야 로그가 출력됩니다.
 *
 * @module lib/logger
 */
import { EXTENSION_NAME } from '@/shared/config/constants';

/** 로그 레벨 타입 */
type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

/** 로그 레벨별 CSS 색상 */
const CSS_COLORS: Record<LogLevel, string> = {
  INFO: '#00bcd4', // 청록색
  WARN: '#ff9800', // 주황색
  ERROR: '#f44336', // 빨간색
  DEBUG: '#9e9e9e', // 회색
};

/** 로그 활성화 상태 (Popup의 디버그 모드와 연동) */
let _enabled = false;

/**
 * 안전한 JSON 직렬화 (순환 참조 방어)
 */
function safeStringify(obj: unknown): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return '[Circular or Unstringifiable Object]';
  }
}

/**
 * 통합 로그 출력 함수
 */
function log(level: LogLevel, message: string, meta?: unknown): void {
  // 디버그 모드가 비활성화되어 있으면 로그 출력 안 함
  if (!_enabled) return;

  const timestamp = new Date().toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  // Build meta string
  let metaStr = '';
  if (meta !== undefined) {
    metaStr = ` ${safeStringify(meta)}`;
  }

  const css = CSS_COLORS[level];

  // Select console function based on level
  let consoleFn: typeof console.log;
  if (level === 'ERROR') {
    consoleFn = console.error;
  } else if (level === 'WARN') {
    consoleFn = console.warn;
  } else {
    consoleFn = console.log;
  }

  consoleFn(
    `%c[${EXTENSION_NAME}] [${level}] [${timestamp}] ${message}${metaStr}`,
    `color: ${css}; font-weight: bold;`,
  );
}

/**
 * Logger 유틸리티 객체
 *
 * @example
 * Logger.setEnabled(settings.debugMode); // 설정에서 활성화
 * Logger.info('Extension loaded');
 * Logger.error('Failed to load', { error: err.message });
 */
export const Logger = {
  /**
   * 로그 출력 활성화/비활성화 설정
   * Popup의 debugMode 설정과 연동됩니다.
   */
  setEnabled: (enabled: boolean): void => {
    _enabled = enabled;
  },

  /** 현재 로그 활성화 상태 확인 */
  isEnabled: (): boolean => _enabled,

  /** INFO 레벨 로그 */
  info: (message: string, meta?: unknown): void => log('INFO', message, meta),

  /** WARN 레벨 로그 */
  warn: (message: string, meta?: unknown): void => log('WARN', message, meta),

  /** ERROR 레벨 로그 */
  error: (message: string, meta?: unknown): void => log('ERROR', message, meta),

  /** DEBUG 레벨 로그 */
  debug: (message: string, meta?: unknown): void => log('DEBUG', message, meta),
};
