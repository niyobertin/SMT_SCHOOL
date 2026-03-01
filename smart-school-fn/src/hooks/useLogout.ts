import { useAppDispatch } from '../redux/hooks';
import { logout } from '../redux/features/auth';

/**
 * Single logout handler.
 *
 * Previously duplicated in:
 *  - BaseSidebarLayout.tsx (handleLogout)
 *  - MainHeader.tsx (handleLogout)
 *
 * Phase 1: Both components import this hook instead.
 */
export const useLogout = () => {
    const dispatch = useAppDispatch();
    return () => {
        dispatch(logout());
        window.location.href = '/';
    };
};
