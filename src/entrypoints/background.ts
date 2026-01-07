import browser from 'webextension-polyfill';

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });
});
