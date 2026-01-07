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
    <div className={`section ${className}`}>
      <div className="section-title">{title}</div>
      {children}
    </div>
  );
}

export default Section;
