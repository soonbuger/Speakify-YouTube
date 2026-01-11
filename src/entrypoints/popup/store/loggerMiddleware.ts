import { Middleware } from '@reduxjs/toolkit';

/**
 * Simple Redux Logger Middleware
 * 액션과 변경된 상태를 콘솔에 출력합니다.
 * Redux DevTools가 연결되지 않을 때 유용합니다.
 */
export const loggerMiddleware: Middleware = (store) => (next) => (action) => {
  // @ts-expect-error action has type properly in runtime
  const actionType = action?.type || 'UNKNOWN';

  console.groupCollapsed(`%c[Redux] ${actionType}`, 'color: #764abc; font-weight: bold;');
  console.log('Prev State:', store.getState());
  console.log('Action:', action);
  const result = next(action);
  console.log('Next State:', store.getState());
  console.groupEnd();
  return result;
};
