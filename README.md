# YouTube Speakify

> **⚠️ LEGAL NOTICE - 법적 고지**
>
> 본 프로젝트는 **비공식 팬메이드 프로젝트**이며, EpidGames 또는 트릭컬 리바이브, Trickcal:Chibi Go와 **공식적인 관련이 없습니다**.
> EpidGames의 요청이 있을 경우 본 저장소는 즉시 비공개 또는 삭제될 수 있습니다.

[![YouTube Demo](http://img.youtube.com/vi/YOUR_VIDEO_ID_HERE/maxresdefault.jpg)](https://youtu.be/YOUR_VIDEO_ID_HERE)
_시연 영상 (준비 중)_

---

유튜브 썸네일에 스피키가 출몰합니다.

### ⚙️ 기본 설정

- **언어**: 영어, 한국어 지원
- **등장 확률**: 모든 썸네일에 나오게 할지, 가끔 깜짝 등장하게 할지 정합니다. (0% ~ 100%)
- **좌우 반전 확률**: 스피키가 쳐다볼 방향을 정합니다. (100%의 경우, 스피키가 왼쪽을 바라봄)

### 🖼️ 오버레이 설정

- **위치**:
  - **스마트**: 썸네일을 분석하여 가장 안전한 빈 공간을 스스로 찾아갑니다.
  - **고정 위치**: 원하는 구석(좌상단, 우하단 등)이나 중앙에 고정할 수 있습니다.
- **크기**: 랜덤하게 생성될 스피키의 최소~최대 크기를 설정합니다.
- **기울기**: 스피키가 갸우뚱하는 각도를 조절합니다.
- **투명도**: 썸네일이 잘 보이도록 스피키를 투명하게 만들 수 있습니다.
- **썸네일 컬러 동기화 🎨**:
  - 썸네일의 톤에 맞춰 스피키의 톤을 보정합니다.
  - **조명 강도 / 색조 강도**: 주변 색에 얼마나 동화될지 미세 조정 가능합니다.

---

## 💾 설치 방법

### Chrome

1.  **다운로드**: 이 저장소의 [Releases](https://github.com/soonbuger/Speakify-YouTube/releases) 페이지에서 최신 `YouTube-Speakify-vX.X.X.zip` 파일을 다운로드하고 압축을 풉니다.
2.  **확장 프로그램 관리**: 크롬(Chrome) 브라우저 주소창에 `chrome://extensions`를 입력하여 이동합니다.
3.  **개발자 모드**: 우측 상단의 **Developer mode (개발자 모드)** 스위치를 켭니다.
4.  **불러오기**: 좌측 상단의 **Load unpacked (압축해제된 확장 프로그램을 로드합니다)** 버튼을 클릭합니다.
5.  **선택**: 1번에서 압축을 푼 폴더(`dist` 혹은 `YouTube-Speakify` 폴더)를 선택합니다.
6.  **완료!**: 유튜브에 접속하면 스피키가 여러분을 반겨줍니다! 🎉

### Microsoft Edge

1.  **다운로드**: 이 저장소의 [Releases](https://github.com/soonbuger/Speakify-YouTube/releases) 페이지에서 최신 `YouTube-Speakify-vX.X.X.zip` 파일을 다운로드하고 압축을 풉니다.
2.  **확장 프로그램 관리**: 엣지(Edge) 브라우저 주소창에 `edge://extensions`를 입력하여 이동합니다.
3.  **개발자 모드**: 좌측 메뉴 하단의 **Developer mode (개발자 모드)** 스위치를 켭니다.
4.  **불러오기**: 상단의 **Load unpacked (압축 풀린 확장 로드)** 버튼을 클릭합니다.
5.  **선택**: 1번에서 압축을 푼 폴더(`dist` 혹은 `YouTube-Speakify` 폴더)를 선택합니다.
6.  **완료!**: 유튜브에 접속하면 스피키가 여러분을 반겨줍니다! 🎉

### Firefox

1.  **다운로드**: 이 저장소의 [Releases](https://github.com/soonbuger/Speakify-YouTube/releases) 페이지에서 최신 `YouTube-Speakify-vX.X.X.zip` 파일을 다운로드하고 압축을 풉니다. (`firefox` 폴더 확인)
2.  **디버깅 페이지**: 주소창에 `about:debugging`을 입력하여 이동합니다.
3.  **내 파이어폭스**: 왼쪽 메뉴에서 [This Firefox (이 파이어폭스)](about:debugging#/runtime/this-firefox)를 클릭합니다.
4.  **임시 로드**: **Load Temporary Add-on... (임시 부가 기능 로드...)** 버튼을 클릭합니다.
5.  **선택**: 1번에서 압축을 푼 폴더 내의 `manifest.json` 파일을 선택합니다.
6.  **완료!**: 유튜브에 접속하여 스피키를 확인하세요! (브라우저를 재시작하면 다시 로드해야 할 수 있습니다.)

---

## 📜 Credits

- **Reference**: [MrBeastify-Youtube](https://github.com/MagicJinn/MrBeastify-Youtube)
- **Character**: 스피키 - [Trickcal: Revive](https://trickcal.com/) (트릭컬 리바이브)
- **Font**: [ONE Mobile POP](https://www.onestorecorp.com/sv/fordev_font/) (OFL License) by ONE Store
