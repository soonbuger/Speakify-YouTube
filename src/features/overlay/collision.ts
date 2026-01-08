/**
 * Multi-Image Overlay - 충돌 방지 알고리즘
 * 이미지 중심 거리 기반으로 겹침을 최소화
 *
 * @module features/overlay/collision
 */

/**
 * 두 위치의 중심 거리가 최소 거리 이상인지 확인
 * @param pos1 첫 번째 위치 (x, y %)
 * @param pos2 두 번째 위치 (x, y %)
 * @param minDistance 최소 거리 (%)
 * @returns true면 충분히 떨어져 있음
 */
export function checkCenterDistance(
  pos1: { x: number; y: number },
  pos2: { x: number; y: number },
  minDistance: number,
): boolean {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance >= minDistance;
}

/**
 * 모든 기존 위치와 충분히 떨어져 있는지 확인
 * @param newPos 새 위치
 * @param existingPositions 기존 위치들
 * @param minDistance 최소 거리
 * @returns true면 배치 가능
 */
export function isPositionValid(
  newPos: { x: number; y: number },
  existingPositions: { x: number; y: number }[],
  minDistance: number,
): boolean {
  return existingPositions.every((pos) => checkCenterDistance(newPos, pos, minDistance));
}

/**
 * 겹치지 않는 랜덤 위치들 생성
 * @param count 생성할 위치 개수
 * @param minDistance 최소 거리 (%, 기본값 15)
 * @param maxAttempts 최대 시도 횟수 (무한루프 방지)
 * @param padding 가장자리 여백 (%, 기본값 10)
 * @returns 위치 배열 (실패 시 겹침 허용)
 */
export function generateNonOverlappingPositions(
  count: number,
  minDistance: number = 15,
  maxAttempts: number = 50,
  padding: number = 10,
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];

  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let newPos: { x: number; y: number };

    do {
      // padding ~ (100 - padding) 범위 내에서 랜덤 위치 생성
      newPos = {
        x: padding + Math.random() * (100 - 2 * padding),
        y: padding + Math.random() * (100 - 2 * padding),
      };
      attempts++;
    } while (!isPositionValid(newPos, positions, minDistance) && attempts < maxAttempts);

    // 최대 시도 횟수 초과 시에도 위치 추가 (graceful degradation)
    positions.push(newPos);
  }

  return positions;
}
