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

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-center mb-2 text-[13px] font-medium text-text">
        <span>{label}</span>
        <span className="font-bold text-primary">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        className="
          w-full h-2 rounded-lg cursor-pointer appearance-none bg-border focus:outline-none 
          
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
        "
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          background: `linear-gradient(to right, #ff9f43 0%, #ff9f43 ${progress}%, #e5e7eb ${progress}%, #e5e7eb 100%)`,
        }}
      />
    </div>
  );
}

export default Slider;
