import { defineConfig } from 'wxt';
import react from '@vitejs/plugin-react';

// See https://wxt.dev/api/config.html
export default defineConfig({
  // React 플러그인 추가
  vite: () => ({
    plugins: [react()],
  }),
  // src/ 폴더 사용
  srcDir: 'src',

  manifest: {
    // i18n 플레이스홀더 사용
    name: '__MSG_extensionName__',
    description: '__MSG_extensionDescription__',
    default_locale: 'ko',
    version: '1.0.0',
    permissions: ['storage'],
    icons: {
      16: '/icon/16.png',
      32: '/icon/32.png',
      48: '/icon/48.png',
      96: '/icon/96.png',
      128: '/icon/128.png',
    },
    web_accessible_resources: [
      {
        resources: ['images/*.png'],
        matches: ['*://*.youtube.com/*'],
      },
    ],
  },
});
