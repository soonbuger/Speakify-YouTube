import React from 'react';

interface SelectOption {
  readonly value: string;
  readonly label: string;
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
}

/**
 * 셀렉트 드롭다운 컴포넌트
 * 언어 선택, 위치 선택 등에 사용
 */
function Select({ label, value, onChange, options }: SelectProps) {
  return (
    <div className="flex justify-between items-center mb-4 last:mb-0">
      <div className="text-[13px] font-medium text-text">{label}</div>
      <div className="relative">
        <select
          className="appearance-none bg-white border border-border rounded-lg py-1.5 pl-3 pr-8 text-xs font-medium text-text focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer shadow-sm transition-all hover:border-primary"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-sub">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
              fillRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default React.memo(Select);
