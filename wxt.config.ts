import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  // src/ 폴더 사용
  srcDir: 'src',

  manifest: {
    // i18n 플레이스홀더 사용
    name: '__MSG_extensionName__',
    description: '__MSG_extensionDescription__',
    default_locale: 'ko',
    version: '1.0.0',
    permissions: ['storage'],
    web_accessible_resources: [
      {
        resources: ['images/*.png'],
        matches: ['*://*.youtube.com/*'],
      },
    ],
  },
});
