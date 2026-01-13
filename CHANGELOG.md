# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2026-01-13

### Added

- 일본어 README (`README.ja.md`) 추가
- `src/i18n/locales.ts`: 번들 i18n 시스템 도입 (Firefox 호환)
- `wxt.config.ts`에 `host_permissions` 추가 (Color Sync Firefox 지원)

### Changed

- i18n 로직 리팩토링: `fetch` 방식에서 JSON 직접 임포트로 전환
- 슬라이더 인라인 스타일을 Tailwind CSS 클래스로 리팩토링
- README 뱃지 색상 통일 (Golden Yellow for Japanese)

### Fixed

- Firefox에서 Color Tint 기능이 작동하지 않던 문제 해결
- DualSlider에서 min/max 값이 같을 때 핸들이 움직이지 않던 버그 수정

## [1.3.1] - 2026-01-12

### Fixed

- Speaki 이슈 수정 - Magic Numbers 상수화

## [1.3.0] - 2026-01-11

### Added

- 기울기(Rotation) 옵션 추가 (0~180도)
- 4개 코너 위치 옵션 추가 (Top-Left, Top-Right, Bottom-Left, Bottom-Right)
- 랜덤 모드 멀티 이미지 지원 강화

### Changed

- UI/UX 개선: Tailwind CSS 마이그레이션
- loggerMiddleware 개선 (Debug Mode 연동)

## [1.2.0] - 2026-01-10

### Added

- Smart Position 기능: IntersectionObserver 도입
- Redux DevTools 디버깅 시스템
- Giant Speaki 이스터에그 (3% 확률)

### Changed

- Bottom-First Scan으로 그리드 스캔 순서 변경
- Static Image Loading 최적화

## [1.1.0] - 2026-01-07

### Added

- Popup UI React 마이그레이션 완료
- Redux Toolkit + Storage 연동
- `useI18n` 커스텀 Hook (실시간 언어 전환)

### Changed

- `types/index.ts`로 타입 통합 (단일 소스)

## [1.0.0] - 2026-01-06

### Added

- 초기 릴리스
- YouTube 썸네일에 Speaki 오버레이 기능
- MutationObserver 기반 성능 최적화
- Shorts 썸네일 지원
- Logger 유틸리티 도입
- AssetLoader 클래스 리팩토링
- 실시간 언어 변경 기능

---

[1.4.0]: https://github.com/soonbuger/Speakify-YouTube/compare/v1.3.1...v1.4.0
[1.3.1]: https://github.com/soonbuger/Speakify-YouTube/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/soonbuger/Speakify-YouTube/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/soonbuger/Speakify-YouTube/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/soonbuger/Speakify-YouTube/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/soonbuger/Speakify-YouTube/releases/tag/v1.0.0
