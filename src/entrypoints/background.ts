import { Logger } from '@/shared/lib/utils/logger';
import browser from 'webextension-polyfill';

export default defineBackground(() => {
  Logger.info('Hello background!', { id: browser.runtime.id });
});
