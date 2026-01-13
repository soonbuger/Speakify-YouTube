import React, { useRef, useState, useCallback } from 'react';

interface DualSliderProps {
  /** 슬라이더 레이블 */
  readonly label: string;
  /** 최소값 상태 */
  readonly minValue: number;
  /** 최대값 상태 */
  readonly maxValue: number;
  /** 값 변경 핸들러 (min, max 함께 전달) */
  readonly onChange: (min: number, max: number) => void;
  /** 범위의 절대 최소값 */
  readonly min: number;
  /** 범위의 절대 최대값 */
  readonly max: number;
  /** 단계 */
  readonly step?: number;
  /** 표시 단위 */
  readonly unit?: string;
  /** 추가 CSS 클래스 */
  readonly className?: string;
}

/**
 * Custom Dual Slider Component
 * - Pure React + Tailwind CSS
 * - Two thumbs (Range selection)
 */
export default function DualSlider({
  label,
  minValue,
  maxValue,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
  className = '',
}: DualSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null);

  // 퍼센트 계산
  const getPercent = useCallback(
    (value: number) => Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)),
    [min, max],
  );

  const minPercent = getPercent(minValue);
  const maxPercent = getPercent(maxValue);

  const getValueFromClientX = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return min;
      const rect = trackRef.current.getBoundingClientRect();
      const trackWidth = rect.width;
      const x = Math.max(0, Math.min(clientX - rect.left, trackWidth));
      const percent = x / trackWidth;
      const rawValue = min + percent * (max - min);
      const steppedValue = Math.round(rawValue / step) * step;
      return Math.min(max, Math.max(min, Number(steppedValue.toFixed(2))));
    },
    [min, max, step],
  );

  const determineTargetThumb = (newValue: number) => {
    const distMin = Math.abs(newValue - minValue);
    const distMax = Math.abs(newValue - maxValue);

    if (distMin < distMax) return 'min';
    if (distMax < distMin) return 'max';

    // 거리가 같을 때 (겹쳐있거나 중간)
    if (minValue === maxValue) {
      if (minValue === max) return 'min'; // 오른쪽 끝이면 Min
      if (maxValue === min) return 'max'; // 왼쪽 끝이면 Max
    }
    return newValue < minValue ? 'min' : 'max';
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const newValue = getValueFromClientX(e.clientX);
    const target = determineTargetThumb(newValue);

    setActiveThumb(target);
    (e.target as Element).setPointerCapture(e.pointerId);

    // 클릭 즉시 값 업데이트
    if (target === 'min') {
      const v = Math.min(newValue, maxValue); // Max와 겹침 허용
      onChange(v, maxValue);
    } else {
      const v = Math.max(newValue, minValue); // Min과 겹침 허용
      onChange(minValue, v);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeThumb) return;
    e.preventDefault();
    const newValue = getValueFromClientX(e.clientX);

    if (activeThumb === 'min') {
      // Max와 겹침 허용 (최소 간격 없음)
      const v = Math.min(newValue, maxValue);
      onChange(Math.max(min, v), maxValue);
    } else {
      // Min과 겹침 허용
      const v = Math.max(newValue, minValue);
      onChange(minValue, Math.min(max, v));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setActiveThumb(null);
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  return (
    <div className="mb-3 last:mb-0 select-none">
      <div className="flex justify-between items-center text-[15px] text-text mb-2">
        <span className="font-medium">{label}</span>
        <span className="text-text-sub tabular-nums font-medium">
          {minValue}
          {unit} ~ {maxValue}
          {unit}
        </span>
      </div>

      <div
        className={`relative flex items-center h-6 cursor-pointer touch-none mx-1 ${className}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Track Background */}
        <div
          ref={trackRef}
          className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden"
        >
          {/* Active Range Fill - Dynamic position via CSS variable */}
          <div
            className="absolute top-0 h-full bg-primary"
            style={
              {
                '--fill-left': `${minPercent}%`,
                '--fill-width': `${maxPercent - minPercent}%`,
                left: 'var(--fill-left)',
                width: 'var(--fill-width)',
              } as React.CSSProperties
            }
          />
        </div>

        {/* Min Thumb - Dynamic position via CSS variable, static centering via Tailwind */}
        <div
          className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-[18px] h-[18px] bg-white border-2 border-primary rounded-full transition-transform z-10 ${
            activeThumb === 'min' ? 'scale-110 ring-2 ring-primary/30 z-30' : 'hover:scale-110'
          } ${minValue === maxValue ? 'shadow-none' : 'shadow-md'}`}
          style={
            {
              '--min-thumb-left': `${minPercent}%`,
              left: 'var(--min-thumb-left)',
            } as React.CSSProperties
          }
        />

        {/* Max Thumb - Dynamic position via CSS variable, static centering via Tailwind */}
        <div
          className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-[18px] h-[18px] bg-white border-2 border-primary rounded-full shadow-md transition-transform z-20 ${
            activeThumb === 'max' ? 'scale-110 ring-2 ring-primary/30 z-30' : 'hover:scale-110'
          }`}
          style={
            {
              '--max-thumb-left': `${maxPercent}%`,
              left: 'var(--max-thumb-left)',
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  );
}
