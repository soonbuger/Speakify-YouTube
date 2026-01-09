import React from 'react';

interface DualSliderProps {
  /** 슬라이더 레이블 */
  readonly label: string;
  /** 최소값 상태 */
  readonly minValue: number;
  /** 최대값 상태 */
  readonly maxValue: number;
  /** 최소값 변경 핸들러 */
  readonly onMinChange: (value: number) => void;
  /** 최대값 변경 핸들러 */
  readonly onMaxChange: (value: number) => void;
  /** 범위의 절대 최소값 */
  readonly min: number;
  /** 범위의 절대 최대값 */
  readonly max: number;
  /** 단계 */
  readonly step?: number;
  /** 표시 단위 */
  readonly unit?: string;
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
          aria-label={`${label} Min`}
          className={`range-slider range-min${minValue >= maxValue - step ? ' range-priority' : ''}`}
          min={min}
          max={max}
          step={step}
          value={minValue}
          onChange={(e) => {
            const newValue = Number(e.target.value);
            // 최소값이 최대값을 넘으면 최대값도 함께 이동
            if (newValue > maxValue) {
              onMaxChange(newValue);
            }
            onMinChange(newValue);
          }}
        />
        <input
          type="range"
          aria-label={`${label} Max`}
          className="range-slider range-max"
          min={min}
          max={max}
          step={step}
          value={maxValue}
          onChange={(e) => {
            const newValue = Number(e.target.value);
            // 최대값이 최소값보다 작아지면 최소값도 함께 이동
            if (newValue < minValue) {
              onMinChange(newValue);
            }
            onMaxChange(newValue);
          }}
        />
      </div>
    </div>
  );
}

export default DualSlider;
