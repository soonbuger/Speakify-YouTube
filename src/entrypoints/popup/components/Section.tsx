import React from 'react';

interface SectionProps {
  /** 섹션 제목 (예: "BASIC", "OVERLAY") */
  title: string;
  /** 섹션 내부에 들어갈 자식 요소들 */
  children: React.ReactNode;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 설정 섹션 컴포넌트
 * 카드 형태의 그룹핑 UI를 제공합니다.
 */
function Section({ title, children, className = '' }: SectionProps) {
  return (
    <div
      className={`mb-4 p-4 bg-background-card/80 backdrop-blur-md rounded-2xl border border-white/60 shadow-card transition-all duration-200 hover:shadow-lg ${className}`}
    >
      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-text-sub mb-3 select-none">
        {title}
      </div>
      {children}
    </div>
  );
}

export default Section;
