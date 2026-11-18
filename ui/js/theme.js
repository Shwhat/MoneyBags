// ---------- theme ----------
// PREFS.theme is light, dark or system. The charts pick their own dark colors from the same palette.
const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
function applyTheme() {
  const dark = PREFS.theme === 'dark' || (PREFS.theme === 'system' && mq && mq.matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}
if (mq && mq.addEventListener) mq.addEventListener('change', () => { if (PREFS.theme === 'system') { applyTheme(); if (B) render(); } });
const THEME_NAMES = { light: 'Light theme', dark: 'Dark theme', system: 'Theme follows the computer' };
function setTheme(t) { PREFS.theme = t; savePrefs(); applyTheme(); render(); flash(THEME_NAMES[t]); }
function toggleTheme() { setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'); }
