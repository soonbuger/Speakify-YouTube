# YouTube Speakify

[![Korean](https://img.shields.io/badge/Language-Korean-3755BE?style=for-the-badge&logo=southkorea&logoColor=white)](README.md)
[![English](https://img.shields.io/badge/Language-English-009630?style=for-the-badge&logo=google-translate&logoColor=white)](README.en.md)
[![Japan](https://img.shields.io/badge/Language-Japanese-D9A404?style=for-the-badge&logo=google-translate&logoColor=white)](README.ja.md)

> 本プロジェクトは**非公式ファンメイドプロジェクト**であり、EpidGamesまたはTrickcal Revive（以前のTrickcal）とは**公式的な関係はありません**。
> EpidGamesからの要請があった場合、本リポジトリは直ちに非公開または削除される可能性があります。

[![YouTube Speakify 試演映像](https://img.youtube.com/vi/_kk-1tjadeA/sddefault.jpg)](https://www.youtube.com/watch?v=_kk-1tjadeA)

YouTubeのサムネイルにｽﾋﾟｷが出没します。

## 設定

### 基本設定

- **言語**: 英語、韓国語、日本語に対応。
- **出現確率**: 全てのサムネイルに出現させるか、たまに出現させるか設定します。
- **左右反転確率**: ｽﾋﾟｷが向く方向を決めます。（100%の場合、ｽﾋﾟｷは左を向きます。）

### オーバーレイ設定

- **位置**: ｽﾋﾟｷが居る場所を決めます。
  - **ランダム (デフォルト)**: ｽﾋﾟｷが**何も考えずに**サムネイルにいます。
  - **スマート**: ｽﾋﾟｷがサムネイルを分析し、コンテンツ（顔、テキスト順）を**なるべく隠さない場所**にいようと努力します。
  - **固定位置**: 好みの隅（左上、右下など）や中央に**静かに**います。
- **画像数 (ランダムのみ)**: ｽﾋﾟｷの個体数を調節します。
- **サイズ**: ｽﾋﾟｷの最小〜最大サイズを設定します。
- **傾き**: ｽﾋﾟｷが首をかしげる角度を調節します。
- **透明度**: ｽﾋﾟｷの透明さを調節します。（0%の場合、ｽﾋﾟｷは完全に透明になります。）
- **サムネイル色同期**: サムネイルのトーンに合わせてｽﾋﾟｷのトーンを補正します。
  - **照明強度**: サムネイルの明るさや暗さに合わせて、ｽﾋﾟｷの照明具合を調節します。
  - **色調強度**: サムネイル固有の色味（赤み、青みなど）にｽﾋﾟｷがどれくらい馴染むかを調節します。

## インストール方法

### Chrome

1.  **ダウンロード**: このリポジトリの [Releases](https://github.com/soonbuger/Speakify-YouTube/releases) ページから最新の `YouTube-Speakify-vX.X.X.Chromium.zip` ファイルをダウンロードして解凍します。
2.  **拡張機能の管理**: Chromeブラウザのアドレスバーに `chrome://extensions` と入力して移動します。
3.  **デベロッパー モード**: 右上の `デベロッパー モード(Developer mode)` をオンにします。
4.  **読み込み**: 左上の `パッケージ化されていない拡張機能を読み込む(Load unpacked)` をクリックします。
5.  **選択**: 手順1で解凍したフォルダ(`YouTube-Speakify`)を選択します。
6.  **完了!**: [YouTube](https://www.youtube.com/)に行くとサムネイルにｽﾋﾟｷが現れます。

### Microsoft Edge

1.  **ダウンロード**: このリポジトリの [Releases](https://github.com/soonbuger/Speakify-YouTube/releases) ページから最新の `YouTube-Speakify-vX.X.X.Chromium.zip` ファイルをダウンロードして解凍します。
2.  **拡張機能の管理**: Edgeブラウザのアドレスバーに `edge://extensions` と入力して移動します。
3.  **開発者モード**: 左メニュー下の `開発者モード(Developer mode)` スイッチをオンにします。
4.  **読み込み**: 上部の `展開して読み込む(Load unpacked)` ボタンをクリックします。
5.  **選択**: 手順1で解凍したフォルダ(`YouTube-Speakify`)を選択します。
6.  **完了!**: [YouTube](https://www.youtube.com/)に行くとサムネイルにｽﾋﾟｷが現れます。

### Firefox

*Chromeを基準に作られているため、Firefox環境では少し不安定な場合があります。
*Firefoxは再起動すると再度読み込む必要がある場合があります。

1.  **ダウンロード**: このリポジトリの [Releases](https://github.com/soonbuger/Speakify-YouTube/releases) ページから最新の `YouTube-Speakify-vX.X.X.Firefox.zip` ファイルをダウンロードして解凍します。
2.  **デバッグページ**: Firefoxブラウザのアドレスバーに `about:debugging` と入力して移動します。
3.  **この Firefox**: 左メニューの `この Firefox(This Firefox)` をクリックします。
4.  **一時的な読み込み**: 上部の `一時的なアドオンを読み込む...(Load Temporary Add-on...)` ボタンをクリックします。
5.  **選択**: 手順1で解凍したフォルダ(`YouTube-Speakify`)内の `manifest.json` ファイルを選択します。
6.  **完了!**: [YouTube](https://www.youtube.com/)に行くとサムネイルにｽﾋﾟｷが現れます。

## クレジット

- **コード参考**: [MrBeastify-Youtube](https://github.com/MagicJinn/MrBeastify-Youtube)
- **キャラクター**: ｽﾋﾟｷ - [Trickcal: Revive](https://trickcal.com/) (トリッカル・もちもちほっぺ大作戦)
- **フォント**: [ONE Mobile POP](https://www.onestorecorp.com/sv/fordev_font/) (韓国語、英語), [Mochiy Pop One](https://github.com/fontdasu/Mochiypop) (日本語)
