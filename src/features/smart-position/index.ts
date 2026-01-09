/**
 * YouTube Speakify - Smart Position Module
 * 텍스트 감지 기반 스마트 오버레이 위치 결정
 *
 * @module features/smart-position
 */

// 공개 API
export { analyzeForSmartPosition, calculateSmartPosition } from './services/positionService';
export type { SmartPositionResult, PositionOptions } from './services/positionService';

// 내부 모듈 (필요 시 직접 import 가능)
export { detectTextRegions, getTextDensityMap } from './detectors/textDetector';
export type { TextRegion, TextDetectorOptions } from './detectors/textDetector';

export { applySobelOperator, toGrayscale } from './core/sobelEdge';
export { createIntegralImage, getAreaSum, getAreaAverage } from './core/integralImage';
