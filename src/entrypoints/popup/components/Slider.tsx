import React, { useRef, useState, useCallback } from 'react';

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
  /** 외부에서 간격 조절 가능 */
  readonly className?: string;
}

/**
 * Custom Slider Component
 * - Pure React + Tailwind CSS (No external libraries)
 * - Cross-browser consistent styling (Chrome/Firefox)
 */
export default function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
  className = '',
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 값 퍼센트 계산 (0 ~ 100%)
  const getPercent = useCallback(
    (value: number) => Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)),
    [min, max],
  );

  // 마우스/터치 위치로부터 값 계산
  const getValueFromClientX = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return min;
      const rect = trackRef.current.getBoundingClientRect();
      const trackWidth = rect.width;
      const x = Math.max(0, Math.min(clientX - rect.left, trackWidth)); // 0 ~ width
      const percent = x / trackWidth;

      const rawValue = min + percent * (max - min);

      // Step 적용
      const steppedValue = Math.round(rawValue / step) * step;

      // 정밀도 보정 및 범위 제한
      return Math.min(max, Math.max(min, Number(steppedValue.toFixed(2))));
    },
    [min, max, step],
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    // 트랙 클릭 시 바로 점프
    e.preventDefault(); // 텍스트 선택 방지
    setIsDragging(true);
    const newValue = getValueFromClientX(e.clientX);
    onChange(newValue);
    // 포인터 캡처 (드래그가 화면 밖으로 나가도 추적)
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const newValue = getValueFromClientX(e.clientX);
    onChange(newValue);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  const percent = getPercent(value);

  return (
    <div className={`mb-3 last:mb-0 select-none ${className}`}>
      {/* Label Row */}
      <div className="flex justify-between items-center text-[15px] text-text mb-3">
        <span className="font-medium">{label}</span>
        <span className="text-text-sub tabular-nums font-medium">
          {value}
          {unit}
        </span>
      </div>

      {/* Slider Visual Track */}
      <div
        className="relative flex items-center h-6 cursor-pointer touch-none mx-1"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div
          ref={trackRef}
          className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden"
        >
          {/* Fill Range */}
          <div
            className="absolute top-0 left-0 h-full bg-primary transition-none"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Thumb */}
        <div
          className={`absolute w-[18px] h-[18px] bg-white border-2 border-primary rounded-full shadow-md transition-transform ${
            isDragging ? 'scale-110 ring-2 ring-primary/30' : 'hover:scale-110'
          }`}
          style={{
            left: `${percent}%`,
            top: '50%',
            transform: `translate(-50%, -50%) ${isDragging ? 'scale(1.1)' : ''}`,
          }}
        />
      </div>
    </div>
  );
}
