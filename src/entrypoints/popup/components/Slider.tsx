import React from 'react';

interface SliderProps {
  /** 슬라이더 레이블 */
  readonly label: string;
  /** 현재 값 */
  readonly value: number;
  /** 값 변경 핸들러 */
  readonly onChange: (value: number) => void;
  /** 최소값 */
  readonly min: number;
  /** 최대값 */
  readonly max: number;
  /** 단계 */
  readonly step?: number;
  /** 표시 단위 (예: "%") */
  readonly unit?: string;
}

/**
 * 슬라이더 컴포넌트
 * 등장 확률, 반전 확률, 투명도 등에 사용
 * 진행률에 따라 주황색으로 채워짐
 */
function Slider({ label, value, onChange, min, max, step = 5, unit = '%' }: SliderProps) {
  // 진행률 계산 (0-100%)
  const progress = ((value - min) / (max - min)) * 100;

  // 진행률에 따른 배경 그라디언트 로직을 CSS 변수로 전달
  const sliderStyle = {
    '--slider-progress': `${progress}%`,
  } as React.CSSProperties;

  return (
    <div className="setting-row">
      <div className="setting-label">
        <span>{label}</span>
        <span className="setting-value">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        className="range-slider"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={sliderStyle}
      />
    </div>
  );
}

export default Slider;
