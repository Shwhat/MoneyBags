// ---------- tabbed ribbon ----------
// Icons are hand-drawn 20 x 20 inline SVG in light-theme colors; the dark theme inverts them.
const RI = {
  save: '<svg viewBox="0 0 20 20"><path d="M3 3h12l2 2v12H3z" fill="#4a77c9" stroke="#2b4f91" stroke-width="1.1"/><rect x="6" y="4" width="7" height="4" fill="#fff"/><rect x="5.5" y="11" width="9" height="5" fill="#dbe6f7"/></svg>',
  undo: '<svg viewBox="0 0 20 20"><path d="M7 5L3 9l4 4M3 9h9a4 4 0 010 8H9" fill="none" stroke="#2b3442" stroke-width="1.6"/></svg>',
  redo: '<svg viewBox="0 0 20 20"><path d="M13 5l4 4-4 4M17 9H8a4 4 0 000 8h3" fill="none" stroke="#2b3442" stroke-width="1.6"/></svg>',
  newexp: '<svg viewBox="0 0 20 20"><path d="M4 2h9v15l-1.5-1-1.5 1-1.5-1L7 17l-1.5-1L4 17z" fill="#fff" stroke="#556" stroke-width="1.2"/><path d="M6 6h5M6 9h5M6 12h3" stroke="#556" stroke-width="1"/><circle cx="15" cy="14" r="4" fill="#2f7d32"/><path d="M15 11.8v4.4M12.8 14h4.4" stroke="#fff" stroke-width="1.5"/></svg>',
  pay: '<svg viewBox="0 0 20 20"><path d="M3 7h12M12 4l3 3-3 3" fill="none" stroke="#2b3442" stroke-width="1.6"/><path d="M17 13H5M8 10l-3 3 3 3" fill="none" stroke="#1f5fbf" stroke-width="1.6"/></svg>',
  rec: '<svg viewBox="0 0 20 20"><rect x="2.5" y="4" width="15" height="13" rx="1" fill="#fff" stroke="#556" stroke-width="1.2"/><path d="M2.5 8h15M6 2.5v3M14 2.5v3" stroke="#556" stroke-width="1.2"/><path d="M13 12.5a3 3 0 11-1-2.2" fill="none" stroke="#2f7d32" stroke-width="1.3"/><path d="M12.2 8.8v1.8h1.8" fill="none" stroke="#2f7d32" stroke-width="1.3"/></svg>',
  cat: '<svg viewBox="0 0 20 20"><path d="M3 3h7l7 7-7 7-7-7z" fill="#f4d58d" stroke="#8a6d1d" stroke-width="1.2"/><circle cx="7" cy="7" r="1.4" fill="#fff" stroke="#8a6d1d"/></svg>',
  dup: '<svg viewBox="0 0 20 20"><rect x="6" y="6" width="10" height="11" fill="#fff" stroke="#2b3442" stroke-width="1.3"/><path d="M4 13V3h9" fill="none" stroke="#2b3442" stroke-width="1.3"/></svg>',
  del: '<svg viewBox="0 0 20 20"><path d="M5 6h10l-1 11H6zM3 6h14M8 6V3h4v3" fill="none" stroke="#a33" stroke-width="1.4"/></svg>',
  ok: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7.5" fill="#e3f1e6" stroke="#2f7d32" stroke-width="1.2"/><path d="M6.5 10.2l2.4 2.4 4.6-5" fill="none" stroke="#2f7d32" stroke-width="1.7"/></svg>',
  flag: '<svg viewBox="0 0 20 20"><path d="M5 2v16" stroke="#2b3442" stroke-width="1.4"/><path d="M5 3h10l-2.5 3.5L15 10H5z" fill="#f4d58d" stroke="#b25d00" stroke-width="1.2"/></svg>',
  bulk: '<svg viewBox="0 0 20 20"><path d="M3 5h9M3 10h9M3 15h9" stroke="#556" stroke-width="1.4"/><path d="M14 13l3-3-1.5-1.5-3 3V13z" fill="#dbe6f7" stroke="#1f5fbf" stroke-width="1.1"/></svg>',
  vlist: '<svg viewBox="0 0 20 20"><rect x="2.5" y="3" width="15" height="14" fill="#fff" stroke="#556" stroke-width="1.2"/><path d="M2.5 7h15M2.5 11h15M2.5 14h15M8 3v14" stroke="#556" stroke-width="1"/><rect x="2.5" y="3" width="15" height="4" fill="#dbe6f7" stroke="#556" stroke-width="1.2"/></svg>',
  vsum: '<svg viewBox="0 0 20 20"><rect x="2.5" y="3" width="15" height="14" fill="#fff" stroke="#556" stroke-width="1.2"/><path d="M5 7h4M5 10h4M5 13h4" stroke="#556" stroke-width="1"/><path d="M11 13.5h4" stroke="#1f5fbf" stroke-width="1.6"/><path d="M11 6.5l4 0M11 9.5h4" stroke="#556" stroke-width="1"/></svg>',
  vchart: '<svg viewBox="0 0 20 20"><path d="M3 3v14h14" fill="none" stroke="#556" stroke-width="1.2"/><rect x="5.5" y="9" width="2.5" height="7" rx=".8" fill="#2a78d6"/><rect x="9" y="6" width="2.5" height="10" rx=".8" fill="#eb6834"/><rect x="12.5" y="11" width="2.5" height="5" rx=".8" fill="#2a78d6"/></svg>',
  prev: '<svg viewBox="0 0 20 20"><path d="M12.5 4l-6 6 6 6" fill="none" stroke="#2b3442" stroke-width="1.8"/></svg>',
  next: '<svg viewBox="0 0 20 20"><path d="M7.5 4l6 6-6 6" fill="none" stroke="#2b3442" stroke-width="1.8"/></svg>',
  year: '<svg viewBox="0 0 20 20"><rect x="2.5" y="4" width="15" height="13" rx="1" fill="#fff" stroke="#556" stroke-width="1.2"/><path d="M2.5 8h15M6 2.5v3M14 2.5v3" stroke="#556" stroke-width="1.2"/><path d="M5 11h2M9 11h2M13 11h2M5 14h2M9 14h2M13 14h2" stroke="#1f5fbf" stroke-width="1.4"/></svg>',
  today: '<svg viewBox="0 0 20 20"><rect x="2.5" y="4" width="15" height="13" rx="1" fill="#fff" stroke="#556" stroke-width="1.2"/><path d="M2.5 8h15M6 2.5v3M14 2.5v3" stroke="#556" stroke-width="1.2"/><rect x="8" y="10.5" width="4" height="4" fill="#1f5fbf"/></svg>',
  importxl: '<svg viewBox="0 0 20 20"><rect x="7" y="2" width="11" height="16" fill="#e8f3ea" stroke="#1e7a3c" stroke-width="1.2"/><path d="M10 7l4 6M14 7l-4 6" stroke="#1e7a3c" stroke-width="1.4"/><path d="M1.5 10h5M4.5 7.5L7 10l-2.5 2.5" fill="none" stroke="#2b3442" stroke-width="1.5"/></svg>',
  csv: '<svg viewBox="0 0 20 20"><path d="M4 2h9l3 3v13H4z" fill="#e8f3ea" stroke="#2f7d32" stroke-width="1.2"/><text x="10" y="14" font-size="5.6" text-anchor="middle" font-family="Arial" font-weight="bold" fill="#2f7d32">CSV</text></svg>',
  xls: '<svg viewBox="0 0 20 20"><path d="M4 2h9l3 3v13H4z" fill="#e8f3ea" stroke="#1e7a3c" stroke-width="1.2"/><text x="10" y="14" font-size="5.6" text-anchor="middle" font-family="Arial" font-weight="bold" fill="#1e7a3c">XLS</text></svg>',
  backup: '<svg viewBox="0 0 20 20"><path d="M3 8h14v9H3z" fill="#f4d58d" stroke="#8a6d1d" stroke-width="1.2"/><path d="M2 5h16v3H2z" fill="#f4d58d" stroke="#8a6d1d" stroke-width="1.2"/><path d="M10 10v5M7.5 12.5L10 15l2.5-2.5" fill="none" stroke="#2b3442" stroke-width="1.4"/></svg>',
  restore: '<svg viewBox="0 0 20 20"><path d="M3 8h14v9H3z" fill="#f4d58d" stroke="#8a6d1d" stroke-width="1.2"/><path d="M2 5h16v3H2z" fill="#f4d58d" stroke="#8a6d1d" stroke-width="1.2"/><path d="M10 15v-5M7.5 12.5L10 10l2.5 2.5" fill="none" stroke="#2b3442" stroke-width="1.4"/></svg>',
  server: '<svg viewBox="0 0 20 20"><rect x="3" y="3" width="14" height="5.5" rx="1" fill="#dbe6f7" stroke="#556" stroke-width="1.2"/><rect x="3" y="11.5" width="14" height="5.5" rx="1" fill="#dbe6f7" stroke="#556" stroke-width="1.2"/><circle cx="6" cy="5.7" r="1" fill="#2f7d32"/><circle cx="6" cy="14.2" r="1" fill="#2f7d32"/></svg>',
  gear: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="3" fill="none" stroke="#2b3442" stroke-width="1.4"/><path d="M10 2v3M10 15v3M2 10h3M15 10h3M4.3 4.3l2.1 2.1M13.6 13.6l2.1 2.1M4.3 15.7l2.1-2.1M13.6 6.4l2.1-2.1" stroke="#2b3442" stroke-width="1.6"/></svg>',
  sun: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="3.5" fill="#f4d58d" stroke="#8a6d1d" stroke-width="1.2"/><path d="M10 2v2.5M10 15.5V18M2 10h2.5M15.5 10H18M4.3 4.3l1.8 1.8M13.9 13.9l1.8 1.8M4.3 15.7l1.8-1.8M13.9 6.1l1.8-1.8" stroke="#8a6d1d" stroke-width="1.3"/></svg>',
  moon: '<svg viewBox="0 0 20 20"><path d="M13.5 15.5A6.5 6.5 0 017.8 3.4a6.5 6.5 0 108.8 9.6 6.6 6.6 0 01-3.1 2.5z" fill="#dbe6f7" stroke="#2b4f91" stroke-width="1.2"/></svg>',
  half: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" fill="#fff" stroke="#2b3442" stroke-width="1.3"/><path d="M10 3a7 7 0 010 14z" fill="#2b3442"/></svg>',
  layout: '<svg viewBox="0 0 20 20"><rect x="2.5" y="3" width="15" height="14" fill="#fff" stroke="#556" stroke-width="1.2"/><rect x="2.5" y="3" width="4.5" height="14" fill="#dbe6f7" stroke="#556" stroke-width="1.2"/><rect x="13" y="3" width="4.5" height="14" fill="#dbe6f7" stroke="#556" stroke-width="1.2"/></svg>',
  wssave: '<svg viewBox="0 0 20 20"><rect x="2.5" y="3" width="15" height="14" fill="#fff" stroke="#556" stroke-width="1.2"/><rect x="2.5" y="3" width="4.5" height="14" fill="#dbe6f7" stroke="#556" stroke-width="1.2"/><circle cx="14" cy="13" r="3.6" fill="#2f7d32"/><path d="M14 11v4M12 13h4" stroke="#fff" stroke-width="1.4"/></svg>',
  ribbon: '<svg viewBox="0 0 20 20"><path d="M3 5h14M3 10h14M3 15h14" stroke="#556" stroke-width="1.3"/><circle cx="7" cy="5" r="1.8" fill="#fff" stroke="#1f5fbf" stroke-width="1.3"/><circle cx="13" cy="10" r="1.8" fill="#fff" stroke="#1f5fbf" stroke-width="1.3"/><circle cx="9" cy="15" r="1.8" fill="#fff" stroke="#1f5fbf" stroke-width="1.3"/></svg>',
  keys: '<svg viewBox="0 0 20 20"><rect x="1.5" y="5" width="17" height="10" rx="1.5" fill="#fff" stroke="#556" stroke-width="1.2"/><path d="M4 8h1.5M7 8h1.5M10 8h1.5M13 8h1.5M4 11h1.5M6.5 12.5h7M14.5 11H16" stroke="#556" stroke-width="1.3"/></svg>',
  info: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7.5" fill="#dbe6f7" stroke="#2b4f91" stroke-width="1.2"/><path d="M10 9v5" stroke="#2b4f91" stroke-width="1.8"/><circle cx="10" cy="6.2" r="1.1" fill="#2b4f91"/></svg>',
  demo: '<svg viewBox="0 0 20 20"><path d="M3 4h6l1 1 1-1h6v12h-6l-1 1-1-1H3z" fill="#fff" stroke="#556" stroke-width="1.2"/><path d="M10 5v11" stroke="#556" stroke-width="1"/><path d="M5 7h3M5 9.5h3M12 7h3M12 9.5h3" stroke="#1f5fbf" stroke-width="1"/></svg>',
  search: '<svg viewBox="0 0 20 20"><circle cx="8.5" cy="8.5" r="5" fill="#fff" stroke="#2b3442" stroke-width="1.5"/><path d="M12.3 12.3L17 17" stroke="#2b3442" stroke-width="1.9"/></svg>',
  clear: '<svg viewBox="0 0 20 20"><path d="M3 4h14l-5 6v6l-4-2v-4z" fill="#dbe6f7" stroke="#556" stroke-width="1.2"/><path d="M13.5 13.5l4 4M17.5 13.5l-4 4" stroke="#a33" stroke-width="1.4"/></svg>',
  cmd: '<svg viewBox="0 0 20 20"><rect x="2" y="4" width="16" height="12" rx="1" fill="#2b3442"/><path d="M5 8l2.5 2L5 12M9 12h5" fill="none" stroke="#fff" stroke-width="1.3"/></svg>',
};

// command id -> [ribbon label, icon, action, on-state test]
const CMDS = {
  saveNow: ['Save now', 'save', 'saveNow'], undo: ['Undo', 'undo', 'undo'], redo: ['Redo', 'redo', 'redo'],
  newExpense: ['New expense', 'newexp', 'newExpense'], newPayment: ['Settle-up payment', 'pay', 'newPayment'], newRecurring: ['Recurring bill', 'rec', 'newRecurring'], categoriesDlg: ['Categories', 'cat', 'categoriesDlg'],
  dupSel: ['Duplicate', 'dup', 'dupSel'], delSel: ['Delete', 'del', 'delSel'], markReviewed: ['Mark reviewed', 'ok', 'markReviewed'], flagReview: ['Needs review', 'flag', 'flagReview'], bulkEdit: ['Change selected', 'bulk', 'bulkEdit'],
  viewExpenses: ['Expenses', 'vlist', 'viewExpenses', () => VIEW.kind === 'expenses'], viewPayments: ['Payments', 'pay', 'viewPayments', () => VIEW.kind === 'payments'],
  viewRecurring: ['Recurring bills', 'rec', 'viewRecurring', () => VIEW.kind === 'recurring'], viewSummary: ['Summary', 'vsum', 'viewSummary', () => VIEW.kind === 'summary'], viewCharts: ['Charts', 'vchart', 'viewCharts', () => VIEW.kind === 'charts'],
  prevMonth: ['Previous month', 'prev', 'prevMonth'], nextMonth: ['Next month', 'next', 'nextMonth'], wholeYear: ['Whole year', 'year', 'wholeYear', () => !VIEW.month], thisMonth: ['This month', 'today', 'thisMonth'],
  findFocus: ['Search', 'search', 'findFocus'], clearFilters: ['Clear filters', 'clear', 'clearFilters'],
  importExcel: ['Import Excel', 'importxl', 'importExcel'], exportCSV: ['Expenses CSV', 'csv', 'exportCSV'], exportPaymentsCSV: ['Payments CSV', 'csv', 'exportPaymentsCSV'], exportExcel: ['Excel workbook', 'xls', 'exportExcel'],
  downloadBackup: ['Download backup', 'backup', 'downloadBackup'], restoreBackup: ['Restore backup', 'restore', 'restoreBackup'], restoreServerBackup: ['Server backups', 'server', 'restoreServerBackup'],
  bookSettings: ['Book settings', 'gear', 'bookSettings'],
  themeLight: ['Light', 'sun', 'themeLight', () => PREFS.theme === 'light'], themeDark: ['Dark', 'moon', 'themeDark', () => PREFS.theme === 'dark'], themeSystem: ['Follow computer', 'half', 'themeSystem', () => PREFS.theme === 'system'],
  resetPanels: ['Reset panels', 'layout', 'resetPanels'], saveWorkspaceDlg: ['Save workspace', 'wssave', 'saveWorkspaceDlg'], customizeRibbon: ['Customize ribbon', 'ribbon', 'customizeRibbon'], toggleCmdline: ['Command line', 'cmd', 'toggleCmdline', () => PREFS.cmdline],
  shortcuts: ['Shortcuts', 'keys', 'shortcuts'], about: ['About', 'info', 'about'], demo: ['Demo book', 'demo', 'demo', () => DEMO],
};
const DEFAULT_RIBBON = [
  { id: 'home', name: 'Home', groups: [
    { name: 'History', items: ['undo', 'redo', 'saveNow'] },
    { name: 'Add', items: ['newExpense', 'newPayment', 'newRecurring'] },
    { name: 'Views', items: ['viewExpenses', 'viewPayments', 'viewRecurring', 'viewSummary', 'viewCharts'] },
    { name: 'Period', items: ['prevMonth', 'nextMonth', 'thisMonth', 'wholeYear'] },
    { name: 'Find', items: ['findFocus', 'clearFilters'] },
  ] },
  { id: 'data', name: 'Data', groups: [
    { name: 'Import', items: ['importExcel'] },
    { name: 'Export', items: ['exportCSV', 'exportPaymentsCSV', 'exportExcel'] },
    { name: 'Backup', items: ['downloadBackup', 'restoreBackup', 'restoreServerBackup'] },
    { name: 'Book', items: ['bookSettings', 'categoriesDlg'] },
  ] },
  { id: 'view', name: 'View', groups: [
    { name: 'Theme', items: ['themeLight', 'themeDark', 'themeSystem'] },
    { name: 'Layout', items: ['resetPanels', 'saveWorkspaceDlg', 'customizeRibbon', 'toggleCmdline'] },
  ] },
  { id: 'help', name: 'Help', groups: [{ name: 'Help', items: ['shortcuts', 'about', 'demo'] }] },
  { id: 'selection', name: 'Selection', contextual: true, groups: [
    { name: 'Selected rows', items: ['dupSel', 'delSel', 'bulkEdit'] },
    { name: 'Review', items: ['markReviewed', 'flagReview'] },
  ] },
];
let ribbonTab = 'home', hadSelection = false;
function ribbonDef() {
  if (!PREFS.ribbon) return DEFAULT_RIBBON;
  const have = new Set(PREFS.ribbon.map(t => t.id)); const add = DEFAULT_RIBBON.filter(t => t.contextual && !have.has(t.id));
  return add.length ? PREFS.ribbon.concat(add) : PREFS.ribbon;
}
function cmdInfo(id) { const c = CMDS[id]; if (!c) return null; return { label: c[0], icon: RI[c[1]] || '', act: c[2], on: c[3] }; }
// the Selection tab appears while rows are selected in the Expenses view and is picked when it first appears
function renderToolbar() {
  const el = $('#toolbar');
  const ctx = sel.size > 0 && VIEW.kind === 'expenses';
  const def = ribbonDef();
  if (ctx && !hadSelection) { const t = def.find(t => t.contextual); if (t) ribbonTab = t.id; }
  hadSelection = ctx;
  const tabs = def.filter(t => !t.contextual || ctx);
  if (!tabs.some(t => t.id === ribbonTab)) ribbonTab = (tabs[0] || {}).id;
  const tab = tabs.find(t => t.id === ribbonTab);
  let s = '<div class="rtabs">' + tabs.map(t => `<div class="rtab${t.id === ribbonTab ? ' active' : ''}${t.contextual ? ' ctx' : ''}" data-rtab="${esc(t.id)}">${esc(t.name)}</div>`).join('') + workspaceSelectHTML() + '</div><div class="rpanel">';
  for (const g of (tab ? tab.groups : [])) {
    const items = g.items.map(id => {
      const ci = cmdInfo(id); if (!ci) return '';
      if (id === 'restoreServerBackup' && !host.has) return '';
      const on = ci.on && ci.on();
      return `<button class="rb${on ? ' on' : ''}" data-act="${ci.act}" title="${esc(ci.label)}">${ci.icon}<span>${esc(ci.label)}</span></button>`;
    }).join('');
    if (items) s += `<div class="rgroup"><div class="ritems">${items}</div><div class="rgname">${esc(g.name)}</div></div>`;
  }
  el.innerHTML = s + '</div>';
}
document.addEventListener('click', e => { const t = e.target.closest('[data-rtab]'); if (t) { ribbonTab = t.dataset.rtab; renderToolbar(); } });
$('#toolbar').addEventListener('contextmenu', e => {
  e.preventDefault();
  const dd = $('#dropdown');
  dd.innerHTML = [['Light theme', 'themeLight'], ['Dark theme', 'themeDark'], ['Theme follows the computer', 'themeSystem'], '-', ['Customize ribbon...', 'customizeRibbon']].map(m => m === '-' ? '<div class="ddsep"></div>' : `<div class="dd" data-act="${m[1]}"><span>${m[0]}</span></div>`).join('');
  dd.style.left = e.clientX + 'px'; dd.style.top = e.clientY + 'px'; dd.classList.remove('hidden');
});

// ---------- customize ribbon ----------
function customizeRibbon() {
  let W = clone(ribbonDef()); let ti = 0, gi = 0, ii = -1, q = '';
  const allCmds = () => Object.keys(CMDS).map(id => [id, CMDS[id][0]]);
  const draw = () => {
    const t = W[ti] || { groups: [] }; const g = t.groups[gi] || { items: [] };
    const list = (rows, cur, kind) => `<div class="cz-list">${rows.map((r, i) => `<div class="cz-row${i === cur ? ' on' : ''}" data-cz="${kind}" data-i="${i}">${esc(r)}</div>`).join('') || '<div class="note" style="padding:6px">(empty)</div>'}</div>`;
    const btns = kind => `<div class="cz-btns"><button type="button" class="btn small" data-czb="${kind}:add">Add</button><button type="button" class="btn small" data-czb="${kind}:ren">Rename</button><button type="button" class="btn small" data-czb="${kind}:del">Remove</button><button type="button" class="btn small" data-czb="${kind}:up">▲</button><button type="button" class="btn small" data-czb="${kind}:dn">▼</button></div>`;
    const avail = allCmds().filter(([id, l]) => !q || (l + ' ' + id).toLowerCase().includes(q.toLowerCase()));
    $('#dlgbody').innerHTML = `<div class="cz">
      <div><h4>Tabs</h4>${list(W.map(x => x.name + (x.contextual ? ' (rows selected)' : '')), ti, 't')}${btns('t')}</div>
      <div><h4>Groups in ${esc(t.name || '')}</h4>${list(t.groups.map(x => x.name), gi, 'g')}${btns('g')}</div>
      <div><h4>Buttons in ${esc(g.name || '')}</h4>${list(g.items.map(id => (cmdInfo(id) || { label: id }).label), ii, 'i')}<div class="cz-btns"><button type="button" class="btn small" data-czb="i:del">Remove</button><button type="button" class="btn small" data-czb="i:up">▲</button><button type="button" class="btn small" data-czb="i:dn">▼</button></div></div>
      <div><h4>Available commands</h4><input class="search" id="czq" placeholder="Search commands" value="${esc(q)}" style="margin:0 0 6px;width:100%"><div class="cz-list">${avail.map(([id, l]) => `<div class="cz-row" data-czadd="${esc(id)}" title="Add to the selected group">${esc(l)}</div>`).join('')}</div><div class="note">Click a command to add it to the selected group.</div></div>
    </div><div class="btnrow"><button type="button" class="btn small" data-czb="x:reset">Reset to default</button></div>`;
    const qi = $('#czq'); qi.oninput = () => { q = qi.value; draw(); const n = $('#czq'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); };
  };
  const askName = (label, v) => { const n = window.prompt(label, v); return n && n.trim(); };
  dialog('Customize ribbon', [], () => { PREFS.ribbon = W; savePrefs(); renderToolbar(); flash('Ribbon saved'); }, 'Save');
  $('#dlg').style.width = '980px'; $('#dlg').style.maxWidth = '96vw';
  draw();
  $('#dlgbody').onclick = e => {
    const r = e.target.closest('[data-cz]');
    if (r) { const i = +r.dataset.i; if (r.dataset.cz === 't') { ti = i; gi = 0; ii = -1; } else if (r.dataset.cz === 'g') { gi = i; ii = -1; } else ii = i; draw(); return; }
    const a = e.target.closest('[data-czadd]');
    if (a) { const g = (W[ti] || {}).groups && W[ti].groups[gi]; if (!g) { flash('Select or add a group first.'); return; } g.items.push(a.dataset.czadd); ii = g.items.length - 1; draw(); return; }
    const b = e.target.closest('[data-czb]'); if (!b) return;
    const [kind, op] = b.dataset.czb.split(':');
    if (kind === 'x') { W = clone(DEFAULT_RIBBON); ti = 0; gi = 0; ii = -1; draw(); flash('Default ribbon restored. Save to keep it.'); return; }
    const t = W[ti];
    const arr = kind === 't' ? W : kind === 'g' ? (t && t.groups) : (t && t.groups[gi] && t.groups[gi].items);
    const idx = kind === 't' ? ti : kind === 'g' ? gi : ii;
    if (!arr) return;
    if (op === 'add') {
      const name = askName(kind === 't' ? 'Tab name:' : 'Group name:', kind === 't' ? 'My tab' : 'My group'); if (!name) return;
      if (kind === 't') { W.push({ id: 'u' + uid(), name, groups: [] }); ti = W.length - 1; gi = 0; }
      else { t.groups.push({ name, items: [] }); gi = t.groups.length - 1; }
    } else if (op === 'ren' && arr[idx]) { const n = askName('New name:', arr[idx].name); if (n) arr[idx].name = n; }
    else if (op === 'del' && arr[idx] != null) { arr.splice(idx, 1); if (kind === 't') ti = Math.max(0, ti - 1); else if (kind === 'g') gi = Math.max(0, gi - 1); else ii = -1; }
    else if ((op === 'up' || op === 'dn') && arr[idx] != null) {
      const j = idx + (op === 'up' ? -1 : 1); if (j < 0 || j >= arr.length) return;
      [arr[idx], arr[j]] = [arr[j], arr[idx]];
      if (kind === 't') ti = j; else if (kind === 'g') gi = j; else ii = j;
    }
    draw();
  };
}

// ---------- preferences (prefs.json, kept per user) ----------
async function loadPrefs() {
  try { const t = await host.readData('prefs.json'); if (t) Object.assign(PREFS, JSON.parse(t)); } catch (e) {}
  // a new program version starts from the default ribbon, so new buttons always show up
  if (PREFS.appVersion !== APP_VERSION) { PREFS.ribbon = null; PREFS.appVersion = APP_VERSION; savePrefs(); }
}
function savePrefs() { host.writeData('prefs.json', JSON.stringify(PREFS)); }
