// In production, register a service worker to serve assets from the local cache.
// The dev server does not register one.

/**
 * Register the production service worker and reload once an update activates.
 */
export default function register() {
  if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', function() {
    const publicUrl = process.env.PUBLIC_URL || '';
    const swUrl = publicUrl + '/service-worker.js';

    navigator.serviceWorker.register(swUrl).then(function(registration) {
      registration.onupdatefound = function() {
        const installingWorker = registration.installing;
        if (!installingWorker) {
          return;
        }
        const hadController = Boolean(navigator.serviceWorker.controller);
        installingWorker.onstatechange = function() {
          if (installingWorker.state === 'activated' && hadController) {
            window.location.reload();
          }
        };
      };
    }).catch(function(error) {
      console.error('Error during service worker registration:', error);
    });
  });
}

/**
 * Remove the service worker.
 */
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(function(registration) {
      registration.unregister();
    });
  }
}
