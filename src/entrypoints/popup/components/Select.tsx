import React from 'react';

interface SelectOption {
  readonly value: string;
  readonly label: string;
  readonly className?: string;
}

interface SelectProps {
  /** 셀렉트 레이블 */
  readonly label: string;
  /** 현재 선택된 값 */
  readonly value: string;
  /** 값 변경 핸들러 */
  readonly onChange: (value: string) => void;
  /** 옵션 목록 */
  readonly options: SelectOption[];
  /** 추가 CSS 클래스 */
  readonly className?: string;
}

/**
 * 셀렉트 드롭다운 컴포넌트
 * 언어 선택, 위치 선택 등에 사용
 */
function Select({ label, value, onChange, options, className = '' }: SelectProps) {
  return (
    <div className={`flex justify-between items-center mb-4 last:mb-0 ${className}`}>
      <div className="text-[15px] text-text">{label}</div>
      <div className="relative w-[120px]">
        <select
          className="
            w-full py-2.5 px-3 pr-8
            appearance-none bg-white text-text text-[15px]
            border border-gray-300/50 rounded-[10px]
            cursor-pointer transition-all
            hover:border-primary
            focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
          "
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className={option.className}>
              {option.label}
            </option>
          ))}
        </select>
        {/* 드롭다운 화살표 */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-sub">
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L5 5L9 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default React.memo(Select);
