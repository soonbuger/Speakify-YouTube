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
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-center mb-2 text-[13px] font-medium text-text">
        <span>{label}</span>
        <span className="font-bold text-primary">
          {minValue}
          {unit} ~ {maxValue}
          {unit}
        </span>
      </div>
      <div className="relative w-full h-2 rounded-lg bg-border">
        {/* 채워지는 트랙 (Filled Track) */}
        <div
          className="absolute top-0 bottom-0 rounded-lg bg-primary pointer-events-none z-0"
          style={{ left: `${startPercent}%`, width: `${endPercent - startPercent}%` }}
        />

        {/* Min Thumb Slider */}
        <input
          type="range"
          aria-label={`${label} Min`}
          className={`
            absolute w-full h-full appearance-none bg-transparent pointer-events-none z-10
            focus:outline-none focus:ring-0
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-primary
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-webkit-slider-thumb]:cursor-pointer

            [&::-moz-range-thumb]:pointer-events-auto
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:border-none
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-primary
            [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-thumb]:transition-transform
            [&::-moz-range-thumb]:hover:scale-110
            [&::-moz-range-thumb]:cursor-pointer
            ${minValue >= maxValue - 5 ? 'z-20' : ''}
          `}
          min={min}
          max={max}
          step={step}
          value={minValue}
          onChange={(e) => {
            const newValue = Number(e.target.value);
            if (newValue > maxValue) onMaxChange(newValue);
            onMinChange(newValue);
          }}
        />

        {/* Max Thumb Slider */}
        <input
          type="range"
          aria-label={`${label} Max`}
          className={`
            absolute w-full h-full appearance-none bg-transparent pointer-events-none z-10
            focus:outline-none focus:ring-0
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-primary
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-webkit-slider-thumb]:cursor-pointer

            [&::-moz-range-thumb]:pointer-events-auto
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:border-none
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-primary
            [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-thumb]:transition-transform
            [&::-moz-range-thumb]:hover:scale-110
            [&::-moz-range-thumb]:cursor-pointer
          `}
          min={min}
          max={max}
          step={step}
          value={maxValue}
          onChange={(e) => {
            const newValue = Number(e.target.value);
            if (newValue < minValue) onMinChange(newValue);
            onMaxChange(newValue);
          }}
        />
      </div>
    </div>
  );
}

export default DualSlider;
