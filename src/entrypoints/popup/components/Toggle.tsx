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
}

/**
 * 토글 스위치 컴포넌트
 * 확장 활성화, 디버그 모드 등에 사용
 */
function Toggle({ label, checked, onChange, id }: ToggleProps) {
  const toggleId = id || `toggle-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="flex justify-between items-center mb-4 last:mb-0">
      <span className="text-[13px] font-medium text-text">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer" htmlFor={toggleId}>
        <input
          type="checkbox"
          className="sr-only peer"
          id={toggleId}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className="
          w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 
          peer-focus:ring-2 peer-focus:ring-primary/50
          peer-checked:after:translate-x-full 
          peer-checked:after:border-white 
          after:content-[''] 
          after:absolute after:top-0.5 after:left-[2px] 
          after:bg-white after:border-gray-300 after:border after:rounded-full 
          after:h-5 after:w-5 after:transition-all 
          peer-checked:bg-primary
        "
        ></div>
      </label>
    </div>
  );
}

export default Toggle;
