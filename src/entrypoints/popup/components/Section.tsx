import React from 'react';

interface SectionProps {
  /** 섹션 제목 (예: "BASIC", "OVERLAY") */
  readonly title: string;
  /** 섹션 내부에 들어갈 자식 요소들 */
  readonly children: React.ReactNode;
  /** 추가 CSS 클래스 */
  readonly className?: string;
}

/**
 * 설정 섹션 컴포넌트
 * 카드 형태의 그룹핑 UI를 제공합니다.
 */
function Section({ title, children, className = '' }: SectionProps) {
  return (
    <div
      className={`
        bg-white rounded-[16px] p-4 mb-4 
        border border-white/50 shadow-card
        transition-all duration-200
        ${className}
      `}
    >
      <div className="text-[11px] font-medium uppercase tracking-[1.2px] text-text-muted mb-3">
        {title}
      </div>
      {children}
    </div>
  );
}

export default Section;
