import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

/**
 * 타입이 지정된 useDispatch hook
 * 일반 useDispatch 대신 이것을 사용하면 타입 안전성 확보
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * 타입이 지정된 useSelector hook
 * 일반 useSelector 대신 이것을 사용하면 RootState 타입 자동 적용
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
