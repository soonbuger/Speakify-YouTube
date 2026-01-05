/**
 * YouTube Speakify - Random Position Module
 * 가중치 기반 랜덤 위치 생성 유틸리티
 *
 * 특징:
 * - 하단 영역 선호 (영상 콘텐츠 가림 최소화)
 * - 좌하단 타임스탬프 영역 회피
 * - 이미지가 컨테이너 밖으로 나가지 않도록 경계 처리
 */

/**
 * 랜덤 위치 결과 타입
 * x, y는 % 단위 (0-100)
 */
export interface RandomPositionResult {
  x: number;
  y: number;
}

/**
 * 가중치 기반 랜덤 위치 생성
 *
 * @param imageSize - 이미지 크기 (% 단위, 기본 20)
 * @returns 랜덤 위치 (x, y % 값)
 *
 * 위치 선택 로직:
 * 1. 하단 2/3 영역에 70% 확률로 배치
 * 2. 좌하단 (타임스탬프 영역) 회피
 * 3. 이미지가 컨테이너 밖으로 나가지 않도록 보정
 */
export function generateRandomPosition(imageSize: number = 20): RandomPositionResult {
  // 이미지가 컨테이너 밖으로 나가지 않도록 최대값 제한
  const maxX = 100 - imageSize;
  const maxY = 100 - imageSize;

  let x: number = 0;
  let y: number = 0;
  const maxAttempts = 10;

  for (let attempts = 0; attempts < maxAttempts; attempts++) {
    // 가중치 기반 Y 위치 생성 (하단 선호)
    // 70% 확률로 하단 2/3 영역, 30% 확률로 상단 1/3 영역
    if (Math.random() < 0.7) {
      // 하단 2/3 영역 (33% ~ maxY)
      y = 33 + Math.random() * (maxY - 33);
    } else {
      // 상단 1/3 영역 (0% ~ 33%)
      y = Math.random() * Math.min(33, maxY);
    }

    // X 위치는 전체 범위에서 랜덤
    x = Math.random() * maxX;

    // 좌하단 타임스탬프 영역 (x < 15%, y > 85%) 회피
    const isInTimestampArea = x < 15 && y > 85;

    if (!isInTimestampArea) {
      break;
    }
  }

  return { x, y };
}
