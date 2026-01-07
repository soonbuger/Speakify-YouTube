import React from 'react';

interface DualSliderProps {
  /** 슬라이더 레이블 */
  label: string;
  /** 최소값 상태 */
  minValue: number;
  /** 최대값 상태 */
  maxValue: number;
  /** 최소값 변경 핸들러 */
  onMinChange: (value: number) => void;
  /** 최대값 변경 핸들러 */
  onMaxChange: (value: number) => void;
  /** 범위의 절대 최소값 */
  min: number;
  /** 범위의 절대 최대값 */
  max: number;
  /** 단계 */
  step?: number;
  /** 표시 단위 */
  unit?: string;
}

/**
 * 듀얼 슬라이더 컴포넌트
 * 크기 범위 설정에 사용 (최소~최대)
 * 두 핸들 사이에 주황색으로 채워짐
 */
function DualSlider({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  min,
  max,
  step = 5,
  unit = '%',
}: DualSliderProps) {
  // 시작점과 끝점 계산 (백분율)
  const startPercent = ((minValue - min) / (max - min)) * 100;
  const endPercent = ((maxValue - min) / (max - min)) * 100;

  // 듀얼 슬라이더 컨테이너 스타일 (CSS 변수 설정)
  const containerStyle: React.CSSProperties = {
    '--start': `${startPercent}%`,
    '--end': `${endPercent}%`,
  } as React.CSSProperties;

  return (
    <div className="setting-row">
      <div className="setting-label">
        <span>{label}</span>
        <span className="setting-value">
          {minValue}
          {unit} ~ {maxValue}
          {unit}
        </span>
      </div>
      <div className="range-slider-dual" style={containerStyle}>
        <input
          type="range"
          className="range-slider range-min"
          min={min}
          max={max}
          step={step}
          value={minValue}
          onChange={(e) => {
            const newValue = Number(e.target.value);
            // 최소값이 최대값을 넘지 않도록
            if (newValue <= maxValue) {
              onMinChange(newValue);
            }
          }}
        />
        <input
          type="range"
          className="range-slider range-max"
          min={min}
          max={max}
          step={step}
          value={maxValue}
          onChange={(e) => {
            const newValue = Number(e.target.value);
            // 최대값이 최소값보다 작아지지 않도록
            if (newValue >= minValue) {
              onMaxChange(newValue);
            }
          }}
        />
      </div>
    </div>
  );
}

export default DualSlider;
