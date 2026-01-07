import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  /** 셀렉트 레이블 */
  label: string;
  /** 현재 선택된 값 */
  value: string;
  /** 값 변경 핸들러 */
  onChange: (value: string) => void;
  /** 옵션 목록 */
  options: SelectOption[];
}

/**
 * 셀렉트 드롭다운 컴포넌트
 * 언어 선택, 위치 선택 등에 사용
 */
function Select({ label, value, onChange, options }: SelectProps) {
  return (
    <div className="setting-row horizontal-layout">
      <div className="setting-label">{label}</div>
      <div className="select-wrapper">
        <select
          className="select-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default Select;
