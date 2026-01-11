import React from 'react';

interface ToggleProps {
  /** 토글 레이블 텍스트 */
  readonly label: string;
  /** 현재 체크 상태 */
  readonly checked: boolean;
  /** 상태 변경 핸들러 */
  readonly onChange: (checked: boolean) => void;
  /** 고유 ID (label 연결용) */
  readonly id?: string;
  /** 추가적인 CSS 클래스 */
  readonly className?: string;
}

/**
 * 토글 스위치 컴포넌트
 * 확장 활성화, 디버그 모드 등에 사용
 */
function Toggle({ label, checked, onChange, id, className = '' }: ToggleProps) {
  const toggleId = id || `toggle-${label.replaceAll(/\s+/g, '-').toLowerCase()}`;

  return (
    <div
      className={`flex items-center justify-between gap-3 text-[15px] text-text w-full mb-4 last:mb-0 ${className}`}
    >
      <span>{label}</span>
      {/*
        [토글 크기 조절 가이드 - 픽셀(px) 단위]
        1. 전체 크기 (목표: 42px x 24px - 날렵하고 귀여운 비율)
          - w-[42px]: 너비
          - h-[24px]: 높이
      */}
      <label className="relative w-[42px] h-[24px] flex-shrink-0 cursor-pointer" htmlFor={toggleId}>
        <input
          type="checkbox"
          id={toggleId}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
          aria-label={label}
        />
        {/* 배경 트랙 */}
        <span
          className="
            absolute inset-0 rounded-full bg-gray-300
            peer-checked:bg-primary
            transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          "
        />
        {/* 썸 (동그란 버튼)
            2. 버튼 크기 및 위치 (현재: 20px, 여백 2px)
              - top-[2px], left-[2px]: 여백
              - w-[20px], h-[20px]: 버튼 크기

            3. 이동 거리 (현재: 18px)
              - translate-x-[18px]
              - 공식: (전체너비 42) - (좌우여백 4) - (버튼크기 20) = 18px
        */}
        <span
          className="
            absolute top-[2px] left-[2px] w-[20px] h-[20px]
            bg-white rounded-full shadow-md
            peer-checked:translate-x-[18px]
            transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          "
        />
      </label>
    </div>
  );
}

export default Toggle;
