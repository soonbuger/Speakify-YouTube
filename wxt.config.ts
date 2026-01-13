import { defineConfig } from 'wxt';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));

// See https://wxt.dev/api/config.html
export default defineConfig({
  // React 플러그인 추가
  vite: () => ({
    plugins: [react()],
    css: {
      postcss: './postcss.config.js',
    },
  }),
  // src/ 폴더 사용
  srcDir: 'src',

  manifest: {
    // i18n 플레이스홀더 사용
    name: '__MSG_extensionName__',
    description: '__MSG_extensionDescription__',
    default_locale: 'ko',
    version: packageJson.version,
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
    content_security_policy: {
      extension_pages:
        "script-src 'self'; object-src 'self'; font-src 'self' https://cdn.jsdelivr.net https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
    },
  },
});
