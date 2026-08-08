import { useEffect, useRef } from 'react';
import { registerSW } from 'virtual:pwa-register';
import toast from 'react-hot-toast';

// PWA lifecycle: registers the service worker, surfaces "update available"
// alerts, auto-applies new deployments while the tab is hidden, and
// periodically re-checks so long-open tabs catch new releases.
export function usePwaUpdate() {
  const updateSWRef = useRef(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return undefined;

    const wasControlled = navigator.serviceWorker.controller !== null;

    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        toast(
          (t) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>New update available</span>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  updateSWRef.current?.(true);
                }}
                style={{
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: '#2F80ED',
                  color: '#fff',
                }}
              >
                Update now
              </button>
            </div>
          ),
          { duration: Infinity }
        );
      },
      onOfflineReady() {
        toast.success('App ready to work offline');
      },
    });
    updateSWRef.current = updateSW;

    // Reload exactly when a waiting worker takes control (auto-applied
    // updates). Skip the first install claim so first-time visitors do not
    // get an extra reload.
    const onControllerChange = () => {
      if (wasControlled) window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    // While the tab is hidden, install the waiting worker so the next open
    // uses the fresh version.
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        updateSWRef.current?.(false);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Re-check for new deployments on focus and every 30 minutes.
    const checkForUpdates = async () => {
      if (!('serviceWorker' in navigator)) return;
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) registration.update();
    };
    const intervalId = setInterval(checkForUpdates, 30 * 60 * 1000);
    window.addEventListener('focus', checkForUpdates);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', checkForUpdates);
      clearInterval(intervalId);
    };
  }, []);

  return updateSWRef;
}
