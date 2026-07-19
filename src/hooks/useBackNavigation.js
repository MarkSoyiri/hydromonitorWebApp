import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

export function useBackNavigation(fallbackRoute) {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
    } else if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(fallbackRoute);
    }
  }, [navigate, location.state, fallbackRoute]);

  return goBack;
}
