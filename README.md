# YouTube Speakify

[![Korean](https://img.shields.io/badge/Language-Korean-3755BE?style=for-the-badge&logo=southkorea&logoColor=white)](README.md)
[![English](https://img.shields.io/badge/Language-English-009630?style=for-the-badge&logo=google-translate&logoColor=white)](README.en.md)
[![Japan](https://img.shields.io/badge/Language-Japanese-D9A404?style=for-the-badge&logo=google-translate&logoColor=white)](README.ja.md)

> 본 프로젝트는 **비공식 팬메이드 프로젝트**이며, EpidGames 또는 트릭컬 리바이브, Trickcal:Chibi Go와 **공식적인 관련이 없습니다**.
> EpidGames의 요청이 있을 경우 본 저장소는 즉시 비공개 또는 삭제될 수 있습니다.

[![YouTube Speakify](https://www.youtube.com/watch?v=_kk-1tjadeA)

유튜브 썸네일에 스피키가 출몰합니다.

## 설정

### 기본 설정

- **언어**: 영어, 한국어, 일본어 지원
- **등장 확률**: 모든 썸네일에 나오게 할지, 가끔 등장하게 할지 정합니다.
- **좌우 반전 확률**: 스피키가 쳐다볼 방향을 정합니다. (100%의 경우, 스피키가 왼쪽을 바라봅니다.)

### 오버레이 설정

- **위치**: 스피키가 있을 자리를 정합니다.
  - **랜덤(기본값)**: 스피키가 아무렇게나 썸네일에 있습니다.
  - **스마트**: 스피키가 썸네일을 분석하여 내용(얼굴, 텍스트 순)을 비교적 덜 가리는 곳에 있으려 노력합니다.
  - **고정 위치**: 원하는 구석(좌상단, 우하단 등)이나 중앙에 얌전히 있습니다.
- **이미지 개수(랜덤 한정)**: 스피키의 개체 수를 조절합니다.
- **크기**: 스피키의 최소 ~ 최대 크기를 설정합니다.
- **기울기**: 스피키가 갸우뚱하는 각도를 조절합니다.
- **투명도**: 스피키의 투명함을 조절합니다. (0%의 경우, 스피키가 완전 투명해집니다.)
- **썸네일 컬러 동기화**: 썸네일의 톤에 맞춰 스피키의 톤을 보정합니다.
  - **조명 강도**: 썸네일이 어둡거나 밝은 정도에 맞춰 스피키의 조명빨을 조절합니다.
  - **색조 강도**: 썸네일의 고유 색감(붉은끼, 푸른끼 등)에 스피키가 얼마나 동화할지 조절합니다.

## 설치 방법

### Chrome

1.  **다운로드**: 이 저장소의 [Releases](https://github.com/soonbuger/Speakify-YouTube/releases) 페이지에서 최신 `YouTube-Speakify-vX.X.X.Chromium.zip` 파일을 다운로드하고 압축을 풉니다.
2.  **확장 프로그램 관리**: 크롬(Chrome) 브라우저 주소창에 `chrome://extensions`를 입력하여 이동합니다.
3.  **개발자 모드**: 우측 상단의 `개발자 모드(Developer mode)`를 켭니다.
4.  **불러오기**: 좌측 상단의 `압축해제된 확장 프로그램을 로드`를 클릭합니다.
5.  **선택**: 1번에서 압축을 푼 폴더(`YouTube-Speakify`)를 선택합니다.
6.  **완료!**: [YouTube](https://www.youtube.com/)로 가면 스피키가 썸네일에 보입니다.

### Microsoft Edge

1.  **다운로드**: 이 저장소의 [Releases](https://github.com/soonbuger/Speakify-YouTube/releases) 페이지에서 최신 `YouTube-Speakify-vX.X.X.Chromium.zip` 파일을 다운로드하고 압축을 풉니다.
2.  **확장 프로그램 관리**: 엣지(Edge) 브라우저 주소창에 `edge://extensions`를 입력하여 이동합니다.
3.  **개발자 모드**: 좌측 하단의 `개발자 모드(Developer mode)` 스위치를 켭니다.
4.  **불러오기**: 상단의 `압축 풀린 파일 로드` 버튼을 클릭합니다.
5.  **선택**: 1번에서 압축을 푼 폴더(`YouTube-Speakify`)를 선택합니다.
6.  **완료!**: [YouTube](https://www.youtube.com/)로 가면 스피키가 썸네일에 보입니다.

### Firefox

*크롬을 기준으로 만들어져 파이어폭스 환경에선 조금 불안정할 수 있습니다.
*파이어폭스는 재시작하면 다시 로드해야 할 수 있습니다.

1.  **다운로드**: 이 저장소의 [Releases](https://github.com/soonbuger/Speakify-YouTube/releases) 페이지에서 최신 `YouTube-Speakify-vX.X.X.Firefox.zip` 파일을 다운로드하고 압축을 풉니다.
2.  **디버깅 페이지**: 파이어폭스(firefox) 브라우저 주소창에 `about:debugging`을 입력하여 이동합니다.
3.  **내 파이어폭스**: 왼쪽 메뉴에서 `이 Firefox`를 클릭합니다.
4.  **임시 로드**: 상단의 `임시 부가 기능 로드...` 버튼을 클릭합니다.
5.  **선택**: 1번에서 압축을 푼 폴더(`YouTube-Speakify`) 내의 `manifest.json` 파일을 선택합니다.
6.  **완료!**: [YouTube](https://www.youtube.com/)로 가면 스피키가 썸네일에 보입니다.

## 출처

- **코드 참고**: [MrBeastify-Youtube](https://github.com/MagicJinn/MrBeastify-Youtube)
- **캐릭터**: 스피키 - [Trickcal: Revive](https://trickcal.com/) (트릭컬 리바이브)
- **폰트**: [ONE Mobile POP](https://www.onestorecorp.com/sv/fordev_font/)(한국어, 영어), [Mochiy Pop One](https://github.com/fontdasu/Mochiypop)(일본어)
