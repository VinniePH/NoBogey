/* global document, window, HTMLAnchorElement */

(() => {
  const allowedTargets = new Set(['nobogey://auth/callback', 'nobogey://reset-password']);
  const target = document.body.dataset.deepLink;
  if (!target || !allowedTargets.has(target)) return;

  const deepLink = `${target}${window.location.search}${window.location.hash}`;
  const openButton = document.querySelector('[data-open-app]');
  if (openButton instanceof HTMLAnchorElement) openButton.href = deepLink;
  window.setTimeout(() => window.location.assign(deepLink), 150);
})();
