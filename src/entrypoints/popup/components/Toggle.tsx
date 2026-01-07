import React from 'react';

interface ToggleProps {
  /** 토글 레이블 텍스트 */
  label: string;
  /** 현재 체크 상태 */
  checked: boolean;
  /** 상태 변경 핸들러 */
  onChange: (checked: boolean) => void;
  /** 고유 ID (label 연결용) */
  id?: string;
}

/**
 * 토글 스위치 컴포넌트
 * 확장 활성화, 디버그 모드 등에 사용
 */
function Toggle({ label, checked, onChange, id }: ToggleProps) {
  const toggleId = id || `toggle-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="setting-row toggle-row">
      <span>{label}</span>
      <label className="toggle" htmlFor={toggleId}>
        <input
          type="checkbox"
          id={toggleId}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="slider"></span>
      </label>
    </div>
  );
}

export default Toggle;
