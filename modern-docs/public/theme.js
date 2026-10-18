// Apply the saved preference before CSS paints, preventing a light/dark flash.
(() => {
  let preference = 'auto';
  try { preference = localStorage.getItem('kod-theme') || 'auto'; } catch {}
  if (!['light', 'dark', 'auto'].includes(preference)) preference = 'auto';
  document.documentElement.dataset.themePreference = preference;
  document.documentElement.dataset.theme = preference === 'auto'
    ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : preference;
})();
