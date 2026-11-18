// ---------- menus, commands and keyboard ----------
const MENUS = {
  file: [['Save now', 'saveNow', 'Ctrl+S'], '-', ['Import from Excel...', 'importExcel'], '-', ['Export expenses (CSV)...', 'exportCSV'], ['Export payments (CSV)...', 'exportPaymentsCSV'], ['Export workbook (Excel)...', 'exportExcel'], '-', ['Download backup (.json)', 'downloadBackup'], ['Restore from backup file...', 'restoreBackup'], ...(host.has ? [['Restore from server backup...', 'restoreServerBackup']] : []), '-', ['Book settings...', 'bookSettings'], ['Categories...', 'categoriesDlg']],
  edit: [['Undo', 'undo', 'Ctrl+Z'], ['Redo', 'redo', 'Ctrl+Y'], '-', ['Duplicate', 'dupSel', 'Ctrl+D'], ['Delete', 'delSel', 'Del'], ['Select all', 'selAll', 'Ctrl+A'], ['Change selected...', 'bulkEdit'], '-', ['Mark reviewed', 'markReviewed'], ['Mark as needs review...', 'flagReview'], '-', ['Search', 'findFocus', 'Ctrl+F'], ['Clear filters', 'clearFilters']],
  insert: [['New expense', 'newExpense', 'N'], ['Settle-up payment...', 'newPayment', 'P'], ['Recurring bill...', 'newRecurring'], ['Category...', 'newCategory']],
  view: [['Expenses', 'viewExpenses', 'Alt+1'], ['Payments', 'viewPayments', 'Alt+2'], ['Recurring bills', 'viewRecurring', 'Alt+3'], ['Summary', 'viewSummary', 'Alt+4'], ['Charts', 'viewCharts', 'Alt+5'], '-', ['Previous month', 'prevMonth', 'PgUp'], ['Next month', 'nextMonth', 'PgDn'], ['This month', 'thisMonth'], ['Whole year', 'wholeYear'], ['Previous year', 'prevYear', 'Shift+PgUp'], ['Next year', 'nextYear', 'Shift+PgDn'], '-', [() => (PREFS.theme === 'light' ? '✓ ' : '  ') + 'Light theme', 'themeLight'], [() => (PREFS.theme === 'dark' ? '✓ ' : '  ') + 'Dark theme', 'themeDark'], [() => (PREFS.theme === 'system' ? '✓ ' : '  ') + 'Theme follows the computer', 'themeSystem'], ['Customize ribbon...', 'customizeRibbon']],
  account: [['About MoneyBags', 'about'], '-', ['Change password...', 'changePassword'], '-', ['Sign out', 'signOut']],
  help: [['Keyboard shortcuts', 'shortcuts'], [() => DEMO ? 'Close the demo book' : 'Open the demo book', 'demo'], '-', ['About MoneyBags', 'about', 'F1']],
};
function openMenu(el) {
  let items = MENUS[el.dataset.menu]; const dd = $('#dropdown');
  if (el.dataset.menu === 'view') items = items.concat(dockMenuItems());
  dd.innerHTML = items.map(i => i === '-' ? '<div class="ddsep"></div>' : `<div class="dd" data-act="${i[1]}"><span>${typeof i[0] === 'function' ? i[0]() : i[0]}</span><span class="k">${i[2] || ''}</span></div>`).join('');
  const r = el.getBoundingClientRect(); dd.style.left = r.left + 'px'; dd.style.top = r.bottom + 'px'; dd.classList.remove('hidden');
  document.querySelectorAll('.menu').forEach(m => m.classList.toggle('open', m === el));
}
function closeMenus() { $('#dropdown').classList.add('hidden'); document.querySelectorAll('.menu').forEach(m => m.classList.remove('open')); }
document.querySelectorAll('.menu').forEach(m => {
  m.addEventListener('mousedown', e => { e.stopPropagation(); m.classList.contains('open') ? closeMenus() : openMenu(m); });
  m.addEventListener('mouseenter', () => { if (document.querySelector('.menu.open') && !m.classList.contains('open')) openMenu(m); });
});
document.addEventListener('mousedown', e => { if (!e.target.closest('#dropdown') && !e.target.closest('.menu')) closeMenus(); });

const thisMonth = () => setPeriod(yearOf(today()), monthOf(today()));
const ACTIONS = {
  saveNow, undo, redo, importExcel, exportCSV, exportPaymentsCSV, exportExcel, downloadBackup, restoreBackup, restoreServerBackup, bookSettings, categoriesDlg,
  dupSel, delSel, selAll, bulkEdit, markReviewed, flagReview, findFocus, clearFilters,
  newExpense, newPayment: () => paymentDlg(), newRecurring: () => recurringDlg(), newCategory,
  viewExpenses: () => setView('expenses'), viewPayments: () => setView('payments'), viewRecurring: () => setView('recurring'), viewSummary: () => setView('summary'), viewCharts: () => setView('charts'),
  prevMonth: () => stepMonth(-1), nextMonth: () => stepMonth(1), prevYear: () => stepYear(-1), nextYear: () => stepYear(1), wholeYear: () => setPeriod(VIEW.year, 0), thisMonth,
  themeLight: () => setTheme('light'), themeDark: () => setTheme('dark'), themeSystem: () => setTheme('system'),
  customizeRibbon, toggleCmdline, saveWorkspaceDlg, manageWorkspacesDlg, resetPanels,
  shortcuts, about: () => about(), demo: () => toggleDemo(), changePassword, signOut,
};
document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]');
  if (a && /^ws:/.test(a.dataset.act)) { closeMenus(); switchWorkspace(a.dataset.act.slice(3)); return; }
  if (a && /^panel_/.test(a.dataset.act)) { closeMenus(); togglePanel(a.dataset.act.slice(6)); return; }
  if (a && ACTIONS[a.dataset.act]) { closeMenus(); ACTIONS[a.dataset.act](); }
});

// ---------- keyboard ----------
const typing = el => el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
document.addEventListener('keydown', e => {
  if ($('#dlg').open) return;
  const k = e.key, ctrl = e.ctrlKey || e.metaKey, t = e.target;
  if (ctrl && !e.altKey) {
    const kk = k.toLowerCase();
    if (kk === 's') { e.preventDefault(); saveNow(); return; }
    if (kk === 'f') { e.preventDefault(); findFocus(); return; }
    if (typing(t)) return;
    if (kk === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return; }
    if (kk === 'y' || (kk === 'z' && e.shiftKey)) { e.preventDefault(); redo(); return; }
    if (kk === 'd') { e.preventDefault(); dupSel(); return; }
    if (kk === 'a') { e.preventDefault(); selAll(); return; }
    return;
  }
  if (e.altKey && /^[1-5]$/.test(k)) { e.preventDefault(); setView(['expenses', 'payments', 'recurring', 'summary', 'charts'][+k - 1]); return; }
  if (k === 'F1') { e.preventDefault(); about(); return; }
  if (typing(t)) return;
  if (k === 'PageUp' || k === 'PageDown') { e.preventDefault(); const d = k === 'PageUp' ? -1 : 1; if (e.shiftKey) stepYear(d); else stepMonth(d); return; }
  if (k === 'Escape') { if (VIEW.kind === 'about') { closeAbout(); return; } if (sel.size) { sel.clear(); render(); } return; }
  if (e.altKey) return;
  if (k === 'n' || k === 'N') { e.preventDefault(); newExpense(); return; }
  if (k === 'p' || k === 'P') { e.preventDefault(); paymentDlg(); return; }
  if (k === 'Delete') { e.preventDefault(); delSel(); return; }
  if (k === 'ArrowDown' || k === 'ArrowUp') { e.preventDefault(); moveSel(k === 'ArrowDown' ? 1 : -1, e.shiftKey); return; }
  if (k === 'Enter' && sel.size) { e.preventDefault(); editSelected(); }
});

// ---------- command line ----------
// type the name of any command (as shown in the menus or ribbon) and press Enter
function toggleCmdline() { PREFS.cmdline = !PREFS.cmdline; savePrefs(); applyCmdline(); renderToolbar(); if (PREFS.cmdline) $('#cmdinput').focus(); flash('Command line ' + (PREFS.cmdline ? 'on' : 'off')); }
function cmdNames() {
  const out = new Map();
  for (const items of Object.values(MENUS)) for (const i of items) if (i !== '-' && typeof i[0] === 'string') out.set(i[0].replace(/\.\.\.$/, '').toLowerCase(), i[1]);
  for (const [id, c] of Object.entries(CMDS)) out.set(c[0].toLowerCase(), c[2]);
  return out;
}
function applyCmdline() { $('#cmdbar').classList.toggle('hidden', !PREFS.cmdline); $('#cmdlist').innerHTML = [...cmdNames().keys()].sort().map(n => `<option value="${esc(n)}">`).join(''); }
$('#cmdinput').addEventListener('keydown', e => {
  if (e.key === 'Escape') { e.target.value = ''; e.target.blur(); return; }
  if (e.key !== 'Enter') return;
  const v = e.target.value.trim().toLowerCase(); if (!v) return;
  const names = cmdNames(); let act = names.get(v) || (ACTIONS[v] ? v : '') || [...names.entries()].find(([n]) => n.startsWith(v))?.[1];
  e.target.value = '';
  if (act && ACTIONS[act]) { ACTIONS[act](); flash('Command: ' + v); } else flash('Unknown command: ' + v);
});
