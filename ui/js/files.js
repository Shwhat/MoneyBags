// ---------- startup (this file is loaded last) ----------
async function start() {
  // without a server, ?today=YYYY-MM-DD fixes the date (used by the tests)
  if (!host.has) { const d = new URLSearchParams(location.search).get('today'); if (validDate(d)) TODAY_OVERRIDE = d; }
  await loadPrefs(); applyTheme(); applyCmdline();
  let b = null, err = '';
  try { b = await host.loadBook(); } catch (e) { err = e.message; }
  B = ensureBook(b || newBook());
  VIEW.year = yearOf(today()); VIEW.month = monthOf(today());
  VIEW.kind = VIEWS[PREFS.view] && PREFS.view !== 'about' ? PREFS.view : 'expenses'; VIEW.prev = VIEW.kind;
  dockInit(); render();
  if (err) { host.readOnly = true; host.lockedBy = ''; tell('MoneyBags', 'The book could not be loaded from the server: ' + esc(err) + '. Reload the page to try again. Nothing will be saved until it loads.'); render(); return; }
  await host.start();
  runRecurring();
  if (!B.setup && canEdit()) setupDlg();
  if (/^#about(\/|$)/.test(location.hash)) about(location.hash.slice(7));
  // a new month's recurring bills are added even if the page stays open
  setInterval(() => { if (!DEMO) runRecurring(); }, 15 * 60 * 1000);
}
start();
// charts are drawn at the width of the work area, so they are drawn again when it changes size
if (typeof ResizeObserver !== 'undefined') { let rw = 0; new ResizeObserver(() => { const w = $('#work').clientWidth; if (B && VIEW.kind === 'charts' && Math.abs(w - rw) > 4) { rw = w; renderWork(); } }).observe($('#workwrap')); }
